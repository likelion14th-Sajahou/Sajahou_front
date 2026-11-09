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

test("시작 전에 휴회하면 휴회로 만들고, 해제하면 다시 시작 전으로 돌아가 시작할 수 있다", async () => {
  const { send } = await loggedIn();
  const rested = await send("retrospectives", { weekId: 35, type: "SESSION", rested: true });
  assert.equal(rested.status, 201);
  assert.equal(rested.data.state, "RESTED");
  assert.equal((await send("retrospectives/current")).data.session.state, "RESTED");

  const unrested = await send("retrospectives/101/rest", { rested: false }, "PATCH");
  assert.deepEqual(unrested.data, { id: 101, state: "NOT_STARTED" });
  const started = await send("retrospectives", { weekId: 35, type: "SESSION", rested: false });
  assert.equal(started.status, 200);
  assert.deepEqual([started.data.id, started.data.state, started.data.currentStep], [101, "IN_PROGRESS", 2]);
});

test("작성 중에 휴회했다가 해제하면 쓰던 내용과 단계가 그대로다", async () => {
  const { send } = await loggedIn();
  await send("retrospectives", { weekId: 35, type: "SESSION", rested: false });
  await send("retrospectives/101", { currentStep: 3, memo: "메모" }, "PATCH");
  assert.deepEqual((await send("retrospectives/101/rest", { rested: true }, "PATCH")).data, { id: 101, state: "RESTED" });
  assert.equal((await send("retrospectives/101", { memo: "휴회 중 저장" }, "PATCH")).error.code, "INVALID_STATE");
  assert.deepEqual((await send("retrospectives/101/rest", { rested: false }, "PATCH")).data, { id: 101, state: "IN_PROGRESS" });
  const detail = await send("retrospectives/101");
  assert.deepEqual([detail.data.currentStep, detail.data.materials.memo, detail.data.isRested], [3, "메모", false]);
  assert.equal((await send("retrospectives/101/rest", { rested: "yes" }, "PATCH")).status, 400);
});

async function startWith(materials, options) {
  const context = await loggedIn(options);
  await context.send("retrospectives", { weekId: 35, type: "SESSION", rested: false });
  if (materials) await context.send("retrospectives/101", materials, "PATCH");
  return context;
}

test("자료가 하나도 없으면 질문 없이 insufficientMaterial을 돌려준다", async () => {
  const { send } = await startWith();
  const result = await send("retrospectives/101/questions", { mode: "AUTO" });
  assert.equal(result.status, 201);
  assert.deepEqual(result.data, { insufficientMaterial: true, questions: [] });
});

test("자료에 맞춰 최대 5개 질문을 만들고, 실습 없음·과제 나중에는 그 질문을 뺀다", async () => {
  const { send } = await startWith({ hasPractice: true, practiceContent: "인터뷰 실습\n둘째 줄", assignmentMode: "RECORD", assignmentContent: "시안 2개 중 2번", memo: "메모" });
  const all = await send("retrospectives/101/questions", { mode: "AUTO" });
  assert.equal(all.status, 201);
  assert.equal(all.data.insufficientMaterial, false);
  assert.equal(all.data.questions.length, 5);
  assert.deepEqual(all.data.questions.map(({ seq }) => seq), [1, 2, 3, 4, 5]);
  assert.equal(all.data.questions.at(-1).tag, "느낀 점");
  assert.equal(all.data.questions.at(-1).quote, null);
  assert.equal(all.data.questions[0].quote, "인터뷰 실습");
  assert.ok(all.data.questions.every(({ status, answer }) => status === "PENDING" && answer === null));
  assert.equal((await send("retrospectives/101")).data.currentStep, 3);

  const { send: sendOnlyMemo } = await startWith({ hasPractice: false, practiceContent: "숨긴 실습", assignmentMode: "LATER", assignmentContent: "숨긴 과제", memo: "메모만" });
  const tail = await sendOnlyMemo("retrospectives/101/questions", { mode: "AUTO" });
  assert.deepEqual(tail.data.questions.map(({ tag }) => tag), ["느낀 점"]);
});

test("다시 받으면 저장된 질문과 답을 그대로 주고, 답한 뒤 자료가 바뀌면 409로 이어 쓰기·새로 만들기를 고르게 한다", async () => {
  const { send } = await startWith({ hasPractice: true, practiceContent: "실습", memo: "메모" });
  const first = (await send("retrospectives/101/questions", { mode: "AUTO" })).data.questions;
  const answered = await send(`questions/${first[0].questionId}`, { status: "ANSWERED", answer: " 답 " }, "PATCH");
  assert.deepEqual(answered.data, { questionId: first[0].questionId, seq: 1, status: "ANSWERED", answer: "답" });
  await send(`questions/${first[1].questionId}`, { status: "SKIPPED" }, "PATCH");

  const again = await send("retrospectives/101/questions", { mode: "AUTO" });
  assert.equal(again.status, 200);
  assert.deepEqual(again.data.questions.map(({ status }) => status).slice(0, 2), ["ANSWERED", "SKIPPED"]);

  await send("retrospectives/101", { memo: "고친 메모" }, "PATCH");
  const changed = await send("retrospectives/101/questions", { mode: "AUTO" });
  assert.equal(changed.status, 409);
  assert.equal(changed.error.code, "MATERIAL_CHANGED");
  assert.deepEqual(changed.error.detail, { answeredCount: 1 });

  const kept = await send("retrospectives/101/questions", { mode: "CONTINUE" });
  assert.equal(kept.data.questions[0].answer, "답");
  assert.equal((await send("retrospectives/101/questions", { mode: "AUTO" })).status, 200);

  await send("retrospectives/101", { memo: "또 고친 메모" }, "PATCH");
  const fresh = await send("retrospectives/101/questions", { mode: "REGENERATE" });
  assert.equal(fresh.status, 201);
  assert.ok(fresh.data.questions.every(({ status }) => status === "PENDING"));
  assert.notEqual(fresh.data.questions[0].questionId, first[0].questionId);
  assert.deepEqual((await send("retrospectives/101")).data.questions, fresh.data.questions);
});

test("답하기는 빈 답·잘못된 상태·첨부를 막고, 답이 없으면 자료가 바뀌어도 질문을 새로 만든다", async () => {
  const { send } = await startWith({ memo: "메모" });
  const [question] = (await send("retrospectives/101/questions", { mode: "AUTO" })).data.questions;
  const invalid = await send(`questions/${question.questionId}`, { status: "ANSWERED", answer: " ", attachmentIds: [1] }, "PATCH");
  assert.deepEqual(Object.keys(invalid.error.fields).sort(), ["answer", "attachmentIds"]);
  assert.equal((await send(`questions/${question.questionId}`, { status: "DONE" }, "PATCH")).status, 400);
  assert.equal((await send("questions/99999", { status: "SKIPPED" }, "PATCH")).status, 404);

  await send("retrospectives/101", { memo: "고친 메모" }, "PATCH");
  assert.equal((await send("retrospectives/101/questions", { mode: "AUTO" })).status, 201);
  assert.equal((await send("retrospectives/101/questions", { mode: "SOMETIMES" })).status, 400);
  await send("retrospectives/101/reset", {});
  assert.deepEqual((await send("retrospectives/101")).data.questions, []);
});
