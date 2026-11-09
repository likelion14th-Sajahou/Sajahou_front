import assert from "node:assert/strict";
import test from "node:test";
import { createMockBrowser } from "./authTestHelpers.js";
import { createMockRetrospectiveFetch } from "./retrospectiveApi.js";

const NOW = Date.parse("2026-11-05T13:40:00Z");

async function loggedIn({ demoPart = null } = {}) {
  const browser = createMockBrowser({ registered: true });
  await browser.send("auth/google", { idToken: "mock-google-id-token" });
  return withRetrospectives(browser.storage, { demoPart, browser });
}

function withRetrospectives(storage, { demoPart = null, browser } = {}) {
  const fetch = createMockRetrospectiveFetch({ storage, now: () => NOW, getDemoPart: () => demoPart });
  const send = async (path, body, method = body === undefined ? "GET" : "POST") => {
    const response = await fetch(`https://preview.test/api/v1/${path}`, {
      method,
      ...(body === undefined ? {} : { body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }),
    });
    return { status: response.status, ...(await response.json()) };
  };
  return { storage, browser, send };
}

test("로그인하지 않으면 401을 돌려준다", async () => {
  const { send } = withRetrospectives(createMockBrowser().storage);
  const response = await send("retrospectives/current");
  assert.equal(response.status, 401);
  assert.equal(response.error.code, "UNAUTHORIZED");
});

test("시작 전 → 시작(201) → 다시 시작(200, 같은 회고) → 작성 중으로 조회된다", async () => {
  const { send } = await loggedIn();
  let current = await send("retrospectives/current");
  assert.equal(current.data.session.state, "NOT_STARTED");
  assert.equal(current.data.session.id, null);
  assert.equal(current.data.week.sessionDeadline, "2026-11-01T23:59:00+09:00");
  assert.equal(current.data.week.assignmentDeadline, "2026-11-03T23:59:00+09:00");

  const created = await send("retrospectives", { weekId: current.data.week.weekId, type: "SESSION", rested: false });
  assert.equal(created.status, 201);
  assert.deepEqual(created.data, { id: 101, type: "SESSION", weekNumber: 35, state: "IN_PROGRESS", currentStep: 2 });
  const again = await send("retrospectives", { weekId: 35, type: "SESSION", rested: false });
  assert.equal(again.status, 200);
  assert.equal(again.data.id, 101);

  current = await send("retrospectives/current");
  assert.deepEqual(current.data.session, { id: 101, state: "IN_PROGRESS", currentStep: 2, assignmentMode: null, lastSavedAt: null });
});

test("임시저장은 보낸 필드만 바꾸고, 상세 조회로 단계와 자료를 복원한다", async () => {
  const { send } = await loggedIn();
  await send("retrospectives", { weekId: 35, type: "SESSION", rested: false });
  const saved = await send("retrospectives/101", { currentStep: 3, practiceContent: "실습", memo: "메모", hasPractice: true }, "PATCH");
  assert.deepEqual(saved.data, { id: 101, state: "IN_PROGRESS", currentStep: 3, lastSavedAt: "2026-11-05T22:40:00+09:00" });

  await send("retrospectives/101", { memo: null, assignmentMode: "LATER" }, "PATCH");
  const detail = await send("retrospectives/101");
  assert.equal(detail.data.currentStep, 3);
  assert.deepEqual(detail.data.materials, {
    hasPractice: true, practiceContent: "실습", assignmentMode: "LATER", assignmentContent: null, codeReview: null, memo: null,
  });
  assert.deepEqual(detail.data.week, { weekNumber: 35, sessionTitle: "역기획 & 리디자인 3", sessionDeadline: "2026-11-01T23:59:00+09:00" });
  assert.deepEqual([detail.data.attachments, detail.data.questions, detail.data.card], [[], [], null]);
});

test("임시저장 입력값이 틀리면 칸별 이유와 함께 400을 돌려주고 저장하지 않는다", async () => {
  const { send } = await loggedIn();
  await send("retrospectives", { weekId: 35, type: "SESSION", rested: false });
  const invalid = await send("retrospectives/101", { currentStep: 5, assignmentMode: "SOON", codeReview: "리뷰", attachmentIds: [999] }, "PATCH");
  assert.equal(invalid.status, 400);
  assert.equal(invalid.error.code, "VALIDATION_ERROR");
  assert.deepEqual(Object.keys(invalid.error.fields).sort(), ["assignmentMode", "attachmentIds", "codeReview", "currentStep"]);
  assert.equal((await send("retrospectives/101")).data.currentStep, 2);
});

test("데모 파트에 따라 마감일과 코드리뷰 저장 가능 여부가 바뀐다", async () => {
  const { send } = await loggedIn({ demoPart: "FRONTEND" });
  const { data } = await send("retrospectives/current");
  assert.equal(data.week.sessionDeadline, "2026-11-03T23:59:00+09:00");
  assert.equal(data.week.assignmentDeadline, "2026-11-02T23:59:00+09:00");
  await send("retrospectives", { weekId: 35, type: "SESSION", rested: false });
  assert.equal((await send("retrospectives/101", { codeReview: "리뷰" }, "PATCH")).status, 200);
});

test("처음부터는 자료를 지우고 2단계로 돌린다", async () => {
  const { send } = await loggedIn();
  await send("retrospectives", { weekId: 35, type: "SESSION", rested: false });
  await send("retrospectives/101", { currentStep: 4, practiceContent: "실습", assignmentMode: "NONE" }, "PATCH");
  const reset = await send("retrospectives/101/reset", {});
  assert.deepEqual(reset.data, { id: 101, state: "IN_PROGRESS", currentStep: 2 });
  const detail = await send("retrospectives/101");
  assert.equal(detail.data.lastSavedAt, null);
  assert.ok(Object.values(detail.data.materials).every((value) => value === null));
});

test("다른 사용자의 회고는 404이고, 과제 회고는 '나중에 쓸게요'를 고른 뒤에만 시작한다", async () => {
  const { send, browser } = await loggedIn();
  await send("retrospectives", { weekId: 35, type: "SESSION", rested: false });
  const blocked = await send("retrospectives", { weekId: 35, type: "ASSIGNMENT", rested: false });
  assert.equal(blocked.status, 409);
  assert.equal(blocked.error.code, "INVALID_STATE");

  await send("retrospectives/101", { assignmentMode: "LATER" }, "PATCH");
  let current = await send("retrospectives/current");
  assert.deepEqual(current.data.openAssignments, [{ id: null, weekNumber: 35, state: "NOT_STARTED", deadline: "2026-11-03T23:59:00+09:00" }]);
  const assignment = await send("retrospectives", { weekId: 35, type: "ASSIGNMENT", rested: false });
  assert.equal(assignment.status, 201);
  current = await send("retrospectives/current");
  assert.equal(current.data.openAssignments[0].id, assignment.data.id);

  // 같은 브라우저에서 데모 계정으로 바꿔 로그인하면 다른 사용자다.
  await browser.send("auth/demo", {});
  assert.equal((await send("retrospectives/101")).status, 404);
  assert.equal((await send("retrospectives/current")).data.session.state, "NOT_STARTED");
});
