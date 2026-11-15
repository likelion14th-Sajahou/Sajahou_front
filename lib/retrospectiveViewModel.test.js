import assert from "node:assert/strict";
import test from "node:test";
import { applyStartedRetrospective, loadRetrospectivePreview, retrospectiveStartState } from "./retrospectiveViewModel.js";
import { saveRetrospective, startRetrospective } from "./retrospectiveApi.js";
import { apiRequest } from "./apiClient.js";

// 실제 휴회 해제 후 GET 응답: IN_PROGRESS/2지만 저장 이력과 내용이 모두 없다.
const session = { id: 12, state: "IN_PROGRESS", currentStep: 2, assignmentMode: null, lastSavedAt: null };
const detail = () => ({ ...session,
  materials: { hasPractice: null, practiceContent: null, assignmentMode: null, assignmentContent: null, codeReview: null, memo: null },
  attachments: [], questions: [], card: null,
});

for (const status of [200, 201]) {
  for (const type of ["SESSION", "ASSIGNMENT"]) {
    test(`시작 ${status} 응답으로 ${type} 회고의 ID·단계를 재조회 없이 반영한다`, async () => {
      const key = type === "ASSIGNMENT" ? "assignment" : "session";
      const current = {
        week: { weekId: 37 },
        session: { id: status === 200 ? 12 : null, state: "NOT_STARTED", assignmentMode: "LATER", lastSavedAt: null },
        assignment: { id: status === 200 ? 12 : null, state: "NOT_STARTED", deadline: "마감일", lastSavedAt: null },
      };
      let calls = 0;
      const started = { id: 12, type, state: "IN_PROGRESS", currentStep: 2 };
      const request = (path, options) => apiRequest(path, {
        ...options, baseUrl: "https://backend.test", fetcher: async (url, init) => {
          calls++;
          assert.equal(url.pathname, "/api/v1/retrospectives");
          assert.equal(init.method, "POST");
          assert.deepEqual(JSON.parse(init.body), { weekId: 37, type, rested: false });
          return Response.json({ success: true, data: started }, { status });
        },
      });
      const result = await startRetrospective({ weekId: 37, type }, { request });
      const next = applyStartedRetrospective(current, result);
      assert.deepEqual(next[key], { ...current[key], id: 12, state: "IN_PROGRESS", currentStep: 2 });
      assert.equal(next[key === "session" ? "assignment" : "session"], current[key === "session" ? "assignment" : "session"]);
      assert.equal(current[key].state, "NOT_STARTED");
      assert.equal(calls, 1);
    });
  }
}

test("휴회 해제로 생긴 빈 회고는 시작하기로 표시하고 원본 응답은 변경하지 않는다", () => {
  assert.equal(retrospectiveStartState(session, detail()), "NOT_STARTED");
  assert.equal(session.state, "IN_PROGRESS");
});

test("저장 이력·이전 단계·자료 선택·텍스트·첨부·질문·카드가 있으면 이어쓰기를 유지한다", () => {
  const saved = "2026-11-14T12:00:00+09:00";
  for (const changes of [
    { lastSavedAt: saved }, { currentStep: 3 }, { currentStep: 4 },
    { materials: { ...detail().materials, memo: "작성한 메모" } },
    { materials: { ...detail().materials, hasPractice: false } },
    { materials: { ...detail().materials, assignmentMode: "LATER" } },
    { attachments: [{ attachmentId: 1 }] }, { questions: [{ questionId: 1 }] }, { card: { cardId: 1 } },
  ]) assert.equal(retrospectiveStartState(session, { ...detail(), ...changes }), "IN_PROGRESS");
  assert.equal(retrospectiveStartState({ ...session, lastSavedAt: saved }, detail()), "IN_PROGRESS");
});

test("휴회·완료·시작 전 상태와 확인할 수 없는 상세 응답은 임의로 바꾸지 않는다", () => {
  for (const state of ["RESTED", "COMPLETED", "NOT_STARTED"]) {
    assert.equal(retrospectiveStartState({ ...session, state }, detail()), state);
  }
  for (const value of [null, { ...detail(), id: 99 }, { ...detail(), materials: null }, { ...detail(), questions: undefined }]) {
    assert.equal(retrospectiveStartState(session, value), "IN_PROGRESS");
  }
});

test("새로고침과 재조회에서도 동일하게 판단하고 상세 조회에 취소 신호를 전달한다", async () => {
  const calls = [];
  const signal = new AbortController().signal;
  const current = { week: { weekNumber: 37 }, session, openAssignments: [{ id: null, weekNumber: 37, state: "NOT_STARTED" }] };
  const request = async (path, options) => {
    calls.push({ path, signal: options.signal });
    return path.endsWith("/current") ? current : detail();
  };
  for (let i = 0; i < 2; i++) {
    const view = await loadRetrospectivePreview({ request, signal });
    assert.equal(view.session.state, "NOT_STARTED");
    assert.equal(view.session.id, 12);
    assert.equal(view.assignment.currentStep, 1);
  }
  assert.deepEqual(calls.map(({ path }) => path), ["/retrospectives/current", "/retrospectives/12", "/retrospectives/current", "/retrospectives/12"]);
  assert.ok(calls.every((call) => call.signal === signal));
});

test("저장한 작성 중 회고와 휴회·완료 회고는 추가 상세 조회를 하지 않는다", async () => {
  for (const changes of [{ lastSavedAt: "저장 시각" }, { currentStep: 3 }, { state: "RESTED" }, { state: "COMPLETED" }]) {
    let calls = 0;
    await loadRetrospectivePreview({ request: async () => {
      calls++;
      return { week: { weekNumber: 37 }, session: { ...session, ...changes }, openAssignments: [] };
    } });
    assert.equal(calls, 1);
  }
});

test("삭제 후 API 11의 NOT_STARTED를 그대로 사용하고 기존 ID와 2단계를 유지한다", async () => {
  const reset = { ...session, state: "NOT_STARTED", currentStep: 2 };
  const current = { week: { weekNumber: 37 }, session: reset, openAssignments: [] };
  const calls = [];
  const request = async (path) => {
    calls.push(path);
    assert.equal(path, "/retrospectives/current");
    return current;
  };
  for (let i = 0; i < 2; i++) {
    const view = await loadRetrospectivePreview({ request });
    assert.equal(view.session.state, "NOT_STARTED");
    assert.equal(view.session.id, reset.id);
    assert.equal(view.session.currentStep, 2);
  }
  assert.equal(calls.length, 2);
});

test("카드 삭제 후 자료·질문·검토 단계를 저장하면 서버의 작성 중 상태와 단계를 그대로 사용한다", async () => {
  for (const currentStep of [2, 3, 4]) {
    const saved = { ...session, state: "IN_PROGRESS", currentStep, lastSavedAt: "2026-11-15T15:00:00+09:00" };
    const view = await loadRetrospectivePreview({ request: async () => ({ week: { weekNumber: 37 }, session: saved, openAssignments: [] }) });
    assert.equal(view.session.state, "IN_PROGRESS");
    assert.equal(view.session.currentStep, currentStep);
  }
});

test("완료 회고는 서버 상태를 유지하며 현 주차 과제만 선택한다", async () => {
    const calls = [];
    const request = async (path) => {
      calls.push(path);
      assert.equal(path, "/retrospectives/current");
      return {
        week: { weekNumber: 37 }, session: { ...session, state: "COMPLETED" },
        openAssignments: [
          { id: 90, weekNumber: 36, state: "COMPLETED" },
          { id: 13, weekNumber: 37, state: "COMPLETED", currentStep: 4 },
        ],
      };
    };
    const view = await loadRetrospectivePreview({ request });
    assert.equal(view.session.state, "COMPLETED");
    assert.equal(view.assignment.id, 13);
    assert.equal(view.assignment.state, "COMPLETED");
    assert.equal(calls.length, 1);
});

test("빈 회고의 기존 ID를 유지하고 임시 저장 후에는 이어쓰기 상태로 돌아온다", async () => {
  let savedAt = null;
  const request = async (path, options) => {
    if (options.method === "PATCH") { savedAt = "2026-11-14T12:00:00+09:00"; return {}; }
    if (path.endsWith("/current")) return {
      week: { weekNumber: 37 }, session: { ...session, lastSavedAt: savedAt }, openAssignments: [],
    };
    return { ...detail(), lastSavedAt: savedAt };
  };
  const before = await loadRetrospectivePreview({ request });
  assert.equal(before.session.state, "NOT_STARTED");
  await saveRetrospective(before.session.id, { currentStep: 2, memo: "작성한 메모" }, { request });
  const after = await loadRetrospectivePreview({ request });
  assert.equal(after.session.state, "IN_PROGRESS");
  assert.equal(after.session.id, before.session.id);
});

test("상세 조회 실패는 시작 전으로 간주하지 않고 재시도할 수 있도록 전달한다", async () => {
  const failure = new Error("상세 조회 실패");
  await assert.rejects(loadRetrospectivePreview({ request: async (path) => {
    if (path.endsWith("/current")) return { week: { weekNumber: 37 }, session, openAssignments: [] };
    throw failure;
  } }), failure);
});
