import assert from "node:assert/strict";
import test from "node:test";
import { loadRetrospectivePreview, retrospectiveStartState } from "./retrospectiveViewModel.js";
import { saveRetrospective } from "./retrospectiveApi.js";

// 실제 휴회 해제 후 GET 응답: IN_PROGRESS/2지만 저장 이력과 내용이 모두 없다.
const session = { id: 12, state: "IN_PROGRESS", currentStep: 2, assignmentMode: null, lastSavedAt: null };
const detail = () => ({ ...session,
  materials: { hasPractice: null, practiceContent: null, assignmentMode: null, assignmentContent: null, codeReview: null, memo: null },
  attachments: [], questions: [], card: null,
});

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

test("저장한 회고와 휴회·완료 회고는 추가 상세 조회를 하지 않는다", async () => {
  for (const changes of [{ lastSavedAt: "저장 시각" }, { currentStep: 3 }, { state: "RESTED" }, { state: "COMPLETED" }]) {
    let calls = 0;
    await loadRetrospectivePreview({ request: async () => {
      calls++;
      return { week: { weekNumber: 37 }, session: { ...session, ...changes }, openAssignments: [] };
    } });
    assert.equal(calls, 1);
  }
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
