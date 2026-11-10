import assert from "node:assert/strict";
import test from "node:test";
import { createMockBrowser } from "./authTestHelpers.js";
import { createMockServerFetch } from "./server.js";
import { resetMockWeek } from "./demoReset.js";

const NOW = Date.parse("2026-11-05T13:40:00Z");

async function loggedIn({ demoPart = null } = {}) {
  const browser = createMockBrowser({ registered: true });
  await browser.send("auth/google", { idToken: "mock-google-id-token" });
  return withRetrospectives(browser.storage, { demoPart, browser });
}

// 회고 API를 공통 mock 진입점(server.js)으로 부른다. 경로의 {id}는 마지막으로 만든 세션 회고 id로 바뀐다.
function withRetrospectives(storage, { demoPart = null, browser } = {}) {
  const fetch = createMockServerFetch({ storage, now: () => NOW, getDemoPart: () => demoPart });
  let lastSessionId = null;
  const send = async (path, body, method = body === undefined ? "GET" : "POST") => {
    const response = await fetch(`https://preview.test/api/v1/${path.replace("{id}", lastSessionId)}`, {
      method,
      ...(body === undefined ? {} : { body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }),
    });
    const result = { status: response.status, ...(await response.json()) };
    if (path === "retrospectives" && result.data?.type === "SESSION") lastSessionId = result.data.id;
    return result;
  };
  return { storage, browser, send, sessionId: () => lastSessionId };
}

test("로그인하지 않으면 401을 돌려준다", async () => {
  const { send } = withRetrospectives(createMockBrowser().storage);
  const response = await send("retrospectives/current");
  assert.equal(response.status, 401);
  assert.equal(response.error.code, "UNAUTHORIZED");
});

test("시작 전 → 시작(201) → 다시 시작(200, 같은 회고) → 작성 중으로 조회된다", async () => {
  const { send, sessionId } = await loggedIn();
  let current = await send("retrospectives/current");
  assert.equal(current.data.session.state, "NOT_STARTED");
  assert.equal(current.data.session.id, null);
  assert.equal(current.data.week.sessionDeadline, "2026-11-01T23:59:00+09:00");
  assert.equal(current.data.week.assignmentDeadline, "2026-11-03T23:59:00+09:00");

  const created = await send("retrospectives", { weekId: current.data.week.weekId, type: "SESSION", rested: false });
  assert.equal(created.status, 201);
  assert.deepEqual(created.data, { id: sessionId(), type: "SESSION", weekNumber: 35, state: "IN_PROGRESS", currentStep: 2 });
  const again = await send("retrospectives", { weekId: 35, type: "SESSION", rested: false });
  assert.equal(again.status, 200);
  assert.equal(again.data.id, sessionId());

  current = await send("retrospectives/current");
  assert.deepEqual(current.data.session, { id: sessionId(), state: "IN_PROGRESS", currentStep: 2, assignmentMode: null, lastSavedAt: null });
});

test("임시저장은 보낸 필드만 바꾸고, 상세 조회로 단계와 자료를 복원한다", async () => {
  const { send, sessionId } = await loggedIn();
  await send("retrospectives", { weekId: 35, type: "SESSION", rested: false });
  const saved = await send("retrospectives/{id}", { currentStep: 3, practiceContent: "실습", memo: "메모", hasPractice: true }, "PATCH");
  assert.deepEqual(saved.data, { id: sessionId(), state: "IN_PROGRESS", currentStep: 3, lastSavedAt: "2026-11-05T22:40:00+09:00" });

  await send("retrospectives/{id}", { memo: null, assignmentMode: "LATER" }, "PATCH");
  const detail = await send("retrospectives/{id}");
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
  const invalid = await send("retrospectives/{id}", { currentStep: 5, assignmentMode: "SOON", codeReview: "리뷰", attachmentIds: [999] }, "PATCH");
  assert.equal(invalid.status, 400);
  assert.equal(invalid.error.code, "VALIDATION_ERROR");
  assert.deepEqual(Object.keys(invalid.error.fields).sort(), ["assignmentMode", "attachmentIds", "codeReview", "currentStep"]);
  assert.equal((await send("retrospectives/{id}")).data.currentStep, 2);
});

test("데모 파트에 따라 마감일과 코드리뷰 저장 가능 여부가 바뀐다", async () => {
  const { send } = await loggedIn({ demoPart: "FRONTEND" });
  const { data } = await send("retrospectives/current");
  assert.equal(data.week.sessionDeadline, "2026-11-03T23:59:00+09:00");
  assert.equal(data.week.assignmentDeadline, "2026-11-02T23:59:00+09:00");
  await send("retrospectives", { weekId: 35, type: "SESSION", rested: false });
  assert.equal((await send("retrospectives/{id}", { codeReview: "리뷰" }, "PATCH")).status, 200);
});

test("처음부터는 자료를 지우고 2단계로 돌린다", async () => {
  const { send, sessionId } = await loggedIn();
  await send("retrospectives", { weekId: 35, type: "SESSION", rested: false });
  await send("retrospectives/{id}", { currentStep: 4, practiceContent: "실습", assignmentMode: "NONE" }, "PATCH");
  const reset = await send("retrospectives/{id}/reset", {});
  assert.deepEqual(reset.data, { id: sessionId(), state: "IN_PROGRESS", currentStep: 2 });
  const detail = await send("retrospectives/{id}");
  assert.equal(detail.data.lastSavedAt, null);
  assert.ok(Object.values(detail.data.materials).every((value) => value === null));
});

test("다른 사용자의 회고는 404이고, 과제 회고는 '나중에 쓸게요'를 고른 뒤에만 시작한다", async () => {
  const { send, browser } = await loggedIn();
  await send("retrospectives", { weekId: 35, type: "SESSION", rested: false });
  const blocked = await send("retrospectives", { weekId: 35, type: "ASSIGNMENT", rested: false });
  assert.equal(blocked.status, 409);
  assert.equal(blocked.error.code, "INVALID_STATE");

  await send("retrospectives/{id}", { assignmentMode: "LATER" }, "PATCH");
  let current = await send("retrospectives/current");
  assert.deepEqual(current.data.openAssignments, [{ id: null, weekNumber: 35, state: "NOT_STARTED", deadline: "2026-11-03T23:59:00+09:00" }]);
  const assignment = await send("retrospectives", { weekId: 35, type: "ASSIGNMENT", rested: false });
  assert.equal(assignment.status, 201);
  current = await send("retrospectives/current");
  assert.equal(current.data.openAssignments[0].id, assignment.data.id);

  // 같은 브라우저에서 데모 계정으로 바꿔 로그인하면 다른 사용자다.
  await browser.send("auth/demo", {});
  assert.equal((await send("retrospectives/{id}")).status, 404);
  assert.equal((await send("retrospectives/current")).data.session.state, "NOT_STARTED");
});

test("시작 전에 휴회하면 휴회로 만들고, 해제하면 다시 시작 전으로 돌아가 시작할 수 있다", async () => {
  const { send, sessionId } = await loggedIn();
  const rested = await send("retrospectives", { weekId: 35, type: "SESSION", rested: true });
  assert.equal(rested.status, 201);
  assert.equal(rested.data.state, "RESTED");
  assert.equal((await send("retrospectives/current")).data.session.state, "RESTED");

  const unrested = await send("retrospectives/{id}/rest", { rested: false }, "PATCH");
  assert.deepEqual(unrested.data, { id: sessionId(), state: "NOT_STARTED" });
  const started = await send("retrospectives", { weekId: 35, type: "SESSION", rested: false });
  assert.equal(started.status, 200);
  assert.deepEqual([started.data.id, started.data.state, started.data.currentStep], [sessionId(), "IN_PROGRESS", 2]);
});

test("작성 중에 휴회했다가 해제하면 쓰던 내용과 단계가 그대로다", async () => {
  const { send, sessionId } = await loggedIn();
  await send("retrospectives", { weekId: 35, type: "SESSION", rested: false });
  await send("retrospectives/{id}", { currentStep: 3, memo: "메모" }, "PATCH");
  assert.deepEqual((await send("retrospectives/{id}/rest", { rested: true }, "PATCH")).data, { id: sessionId(), state: "RESTED" });
  assert.equal((await send("retrospectives/{id}", { memo: "휴회 중 저장" }, "PATCH")).error.code, "INVALID_STATE");
  assert.deepEqual((await send("retrospectives/{id}/rest", { rested: false }, "PATCH")).data, { id: sessionId(), state: "IN_PROGRESS" });
  const detail = await send("retrospectives/{id}");
  assert.deepEqual([detail.data.currentStep, detail.data.materials.memo, detail.data.isRested], [3, "메모", false]);
  assert.equal((await send("retrospectives/{id}/rest", { rested: "yes" }, "PATCH")).status, 400);
});

async function startWith(materials, options) {
  const context = await loggedIn(options);
  await context.send("retrospectives", { weekId: 35, type: "SESSION", rested: false });
  if (materials) await context.send("retrospectives/{id}", materials, "PATCH");
  return context;
}

test("자료가 하나도 없으면 질문 없이 insufficientMaterial을 돌려준다", async () => {
  const { send } = await startWith();
  const result = await send("retrospectives/{id}/questions", { mode: "AUTO" });
  assert.equal(result.status, 201);
  assert.deepEqual(result.data, { insufficientMaterial: true, questions: [] });
});

test("자료에 맞춰 최대 5개 질문을 만들고, 실습 없음·과제 나중에는 그 질문을 뺀다", async () => {
  const { send } = await startWith({ hasPractice: true, practiceContent: "인터뷰 실습\n둘째 줄", assignmentMode: "RECORD", assignmentContent: "시안 2개 중 2번", memo: "메모" });
  const all = await send("retrospectives/{id}/questions", { mode: "AUTO" });
  assert.equal(all.status, 201);
  assert.equal(all.data.insufficientMaterial, false);
  assert.equal(all.data.questions.length, 5);
  assert.deepEqual(all.data.questions.map(({ seq }) => seq), [1, 2, 3, 4, 5]);
  assert.equal(all.data.questions.at(-1).tag, "느낀 점");
  assert.equal(all.data.questions.at(-1).quote, null);
  assert.equal(all.data.questions[0].quote, "인터뷰 실습");
  assert.ok(all.data.questions.every(({ status, answer }) => status === "PENDING" && answer === null));
  assert.equal((await send("retrospectives/{id}")).data.currentStep, 3);

  const { send: sendOnlyMemo } = await startWith({ hasPractice: false, practiceContent: "숨긴 실습", assignmentMode: "LATER", assignmentContent: "숨긴 과제", memo: "메모만" });
  const tail = await sendOnlyMemo("retrospectives/{id}/questions", { mode: "AUTO" });
  assert.deepEqual(tail.data.questions.map(({ tag }) => tag), ["느낀 점"]);
});

test("다시 받으면 저장된 질문과 답을 그대로 주고, 답한 뒤 자료가 바뀌면 409로 이어 쓰기·새로 만들기를 고르게 한다", async () => {
  const { send } = await startWith({ hasPractice: true, practiceContent: "실습", memo: "메모" });
  const first = (await send("retrospectives/{id}/questions", { mode: "AUTO" })).data.questions;
  const answered = await send(`questions/${first[0].questionId}`, { status: "ANSWERED", answer: " 답 " }, "PATCH");
  assert.deepEqual(answered.data, { questionId: first[0].questionId, seq: 1, status: "ANSWERED", answer: "답" });
  await send(`questions/${first[1].questionId}`, { status: "SKIPPED" }, "PATCH");

  const again = await send("retrospectives/{id}/questions", { mode: "AUTO" });
  assert.equal(again.status, 200);
  assert.deepEqual(again.data.questions.map(({ status }) => status).slice(0, 2), ["ANSWERED", "SKIPPED"]);

  await send("retrospectives/{id}", { memo: "고친 메모" }, "PATCH");
  const changed = await send("retrospectives/{id}/questions", { mode: "AUTO" });
  assert.equal(changed.status, 409);
  assert.equal(changed.error.code, "MATERIAL_CHANGED");
  assert.deepEqual(changed.error.detail, { answeredCount: 1 });

  const kept = await send("retrospectives/{id}/questions", { mode: "CONTINUE" });
  assert.equal(kept.data.questions[0].answer, "답");
  assert.equal((await send("retrospectives/{id}/questions", { mode: "AUTO" })).status, 200);

  await send("retrospectives/{id}", { memo: "또 고친 메모" }, "PATCH");
  const fresh = await send("retrospectives/{id}/questions", { mode: "REGENERATE" });
  assert.equal(fresh.status, 201);
  assert.ok(fresh.data.questions.every(({ status }) => status === "PENDING"));
  assert.notEqual(fresh.data.questions[0].questionId, first[0].questionId);
  assert.deepEqual((await send("retrospectives/{id}")).data.questions, fresh.data.questions);
});

test("답하기는 빈 답·잘못된 상태·첨부를 막고, 답이 없으면 자료가 바뀌어도 질문을 새로 만든다", async () => {
  const { send } = await startWith({ memo: "메모" });
  const [question] = (await send("retrospectives/{id}/questions", { mode: "AUTO" })).data.questions;
  const empty = await send(`questions/${question.questionId}`, { status: "ANSWERED", answer: " " }, "PATCH");
  assert.deepEqual(Object.keys(empty.error.fields), ["answer"]);
  // 첨부는 프로젝트 마치기의 '산출물 요청' 질문만 받는다.
  const withAttachment = await send(`questions/${question.questionId}`, { status: "SKIPPED", attachmentIds: [1] }, "PATCH");
  assert.deepEqual(Object.keys(withAttachment.error.fields), ["attachmentIds"]);
  assert.equal((await send(`questions/${question.questionId}`, { status: "DONE" }, "PATCH")).status, 400);
  assert.equal((await send("questions/99999", { status: "SKIPPED" }, "PATCH")).status, 404);

  await send("retrospectives/{id}", { memo: "고친 메모" }, "PATCH");
  assert.equal((await send("retrospectives/{id}/questions", { mode: "AUTO" })).status, 201);
  assert.equal((await send("retrospectives/{id}/questions", { mode: "SOMETIMES" })).status, 400);
  await send("retrospectives/{id}/reset", {});
  assert.deepEqual((await send("retrospectives/{id}")).data.questions, []);
});

test("회고와 홈은 같은 저장소를 봐서, 시작·휴회한 상태가 홈 응답에도 그대로 보인다", async () => {
  const { send } = await loggedIn();
  let home = (await send("home")).data;
  assert.deepEqual(home.sessionRetrospective, { id: null, state: "NOT_STARTED" });
  assert.equal(home.currentWeek.weekNumber, 35);
  assert.equal(home.stickers.showThisWeekSlot, true);

  await send("retrospectives", { weekId: 35, type: "SESSION", rested: false });
  assert.equal((await send("home")).data.sessionRetrospective.state, "IN_PROGRESS");
  await send("retrospectives/{id}/rest", { rested: true }, "PATCH");
  home = (await send("home")).data;
  assert.equal(home.sessionRetrospective.state, "RESTED");
  assert.equal(home.stickers.showThisWeekSlot, false);
});

test("공통 진입점도 checkCsrf면 GET이 아닌 요청의 CSRF 토큰을 검사한다", async () => {
  const browser = createMockBrowser({ registered: true });
  await browser.send("auth/google", { idToken: "mock-google-id-token" });
  const fetch = createMockServerFetch({ storage: browser.storage, now: () => NOW, checkCsrf: true });
  const { data: csrf } = await (await browser.send("auth/csrf")).json();
  const start = (headers) => fetch("https://preview.test/api/v1/retrospectives", {
    method: "POST", body: JSON.stringify({ weekId: 35, type: "SESSION", rested: false }), headers: { "Content-Type": "application/json", ...headers },
  });
  const rejected = await start({});
  assert.equal(rejected.status, 403);
  assert.equal((await rejected.json()).error.code, "CSRF_INVALID");
  assert.equal((await start({ [csrf.headerName]: csrf.token })).status, 201);
  assert.equal((await fetch("https://preview.test/api/v1/retrospectives/current")).status, 200);
});

test("초안 만들기(19)는 자료와 답으로 회고록·DRAFT 카드를 만들고, 기록에 없는 칸은 비워 blanks에 넣는다", async () => {
  const { send } = await startWith({ hasPractice: true, practiceContent: "인터뷰 실습\n둘째 줄", assignmentMode: "LATER", memo: "메모" });
  const questions = (await send("retrospectives/{id}/questions", { mode: "AUTO" })).data.questions;
  await send(`questions/${questions[0].questionId}`, { status: "ANSWERED", answer: "3명 모두 쿠폰을 말했어요" }, "PATCH");

  const { status, data } = await send("retrospectives/{id}/review", {});
  assert.equal(status, 200);
  const { card } = data;
  assert.equal(card.status, "DRAFT");
  assert.deepEqual(card.competencyIds, []);
  assert.equal(card.title, "인터뷰 실습");
  assert.equal(card.result, "3명 모두 쿠폰을 말했어요");
  assert.equal(card.learned, null);
  assert.ok(card.blanks.includes("learned"));
  assert.match(card.fullMarkdown, /### 실습\n- 인터뷰 실습\n- 둘째 줄/);
  assert.match(card.fullMarkdown, /과제 회고에서 따로 정리해요/);
  assert.match(card.fullMarkdown, /세션 자료 PDF를 올리면/);
  assert.match(card.fullMarkdown, /### 느낀 점\n\(한 줄 남겨 주세요\)/);

  const detail = (await send("retrospectives/{id}")).data;
  assert.equal(detail.currentStep, 4);
  assert.equal(detail.card.cardId, card.cardId);
  assert.ok(detail.card.evidenceSummary.includes("AI 질문 답변 1개"));
  // 초안은 나의 사자록 목록에 나오지 않는다.
  assert.equal((await send("story-cards")).data.cards.some(({ cardId }) => cardId === card.cardId), false);
});

test("초안 카드는 태그 0개로 수정할 수 있고, 다시 만들면 고친 답으로 덮어쓰되 고른 태그는 남긴다", async () => {
  const { send } = await startWith({ hasPractice: true, practiceContent: "실습" });
  const questions = (await send("retrospectives/{id}/questions", { mode: "AUTO" })).data.questions;
  const { card } = (await send("retrospectives/{id}/review", {})).data;
  const tags = (await send("competencies")).data;
  assert.equal((await send(`story-cards/${card.cardId}`, { competencyIds: [] }, "PATCH")).status, 200);
  assert.equal((await send(`story-cards/${card.cardId}`, { competencyIds: [tags[0].id, tags[1].id, tags[2].id, tags[3].id] }, "PATCH")).error.code, "COMPETENCY_LIMIT");
  await send(`story-cards/${card.cardId}`, { title: "고친 제목", competencyIds: [tags[0].id] }, "PATCH");

  const reflection = questions.find(({ tag }) => tag === "느낀 점");
  await send(`questions/${reflection.questionId}`, { status: "ANSWERED", answer: "먼저 물어보기" }, "PATCH");
  const again = (await send("retrospectives/{id}/review", {})).data.card;
  assert.equal(again.cardId, card.cardId);
  assert.equal(again.learned, "먼저 물어보기");
  assert.deepEqual(again.competencyIds, [tags[0].id]);

  await send("retrospectives/{id}/reset", {});
  assert.equal((await send("retrospectives/{id}")).data.card, null);
  assert.equal((await send(`story-cards/${card.cardId}`)).status, 404);
});

test("저장(20)은 태그 1~3개일 때 회고를 완료하고 카드를 공개해 사자록·발자국에 쌓는다", async () => {
  const { send, storage } = await startWith({ hasPractice: true, practiceContent: "실습", assignmentMode: "LATER" });
  await send("retrospectives/{id}/questions", { mode: "AUTO" });
  const { card } = (await send("retrospectives/{id}/review", {})).data;
  const blocked = await send("retrospectives/{id}/complete", {});
  assert.equal(blocked.status, 400);
  assert.equal(blocked.error.code, "COMPETENCY_LIMIT");

  const [tag] = (await send("competencies")).data;
  await send(`story-cards/${card.cardId}`, { competencyIds: [tag.id] }, "PATCH");
  const done = await send("retrospectives/{id}/complete", {});
  assert.equal(done.status, 200);
  assert.deepEqual(done.data, {
    state: "COMPLETED", cardId: card.cardId, weekNumber: 35, isLate: true,
    assignmentPending: { weekNumber: 35, deadline: "2026-11-03T23:59:00+09:00" },
  });
  assert.equal((await send("retrospectives/current")).data.session.state, "COMPLETED");
  assert.equal((await send(`story-cards/${card.cardId}`)).data.status, "PUBLISHED");
  assert.ok((await send("story-cards")).data.cards.some(({ cardId }) => cardId === card.cardId));
  const week35 = (await send("footprints")).data.weeks.find(({ weekNumber }) => weekNumber === 35);
  assert.equal(week35.status, "COMPLETED");
  assert.equal((await send("retrospectives/{id}/complete", {})).error.code, "INVALID_STATE");

  // 데모 처음부터 다시 보기: 이번 주 회고와 카드, 발자국을 지운다.
  const userId = JSON.parse(storage.getItem("sajarok_mock_auth")).session.user.id;
  resetMockWeek(storage, userId);
  assert.equal((await send("retrospectives/current")).data.session.state, "NOT_STARTED");
  assert.equal((await send(`story-cards/${card.cardId}`)).status, 404);
  assert.equal((await send("footprints")).data.weeks.find(({ weekNumber }) => weekNumber === 35).status, "THIS_WEEK");
});

test("과제 회고는 '나중에 쓸게요'를 고른 주에 따로 시작해 저장까지 하고, 회고록에 세션 내용 정리를 넣지 않는다", async () => {
  const { send } = await startWith({ assignmentMode: "LATER" });
  const assignment = (await send("retrospectives", { weekId: 35, type: "ASSIGNMENT", rested: false })).data;
  await send(`retrospectives/${assignment.id}`, { assignmentContent: "장바구니 과제" }, "PATCH");
  const questions = (await send(`retrospectives/${assignment.id}/questions`, { mode: "AUTO" })).data.questions;
  assert.equal(questions.at(-1).content, "이번 과제에서 다음에도 가져가고 싶은 게 있다면요?");
  const { card } = (await send(`retrospectives/${assignment.id}/review`, {})).data;
  assert.match(card.fullMarkdown, /^## 35주차 과제 회고/);
  assert.doesNotMatch(card.fullMarkdown, /세션 내용 정리/);
  const [tag] = (await send("competencies")).data;
  await send(`story-cards/${card.cardId}`, { competencyIds: [tag.id] }, "PATCH");
  const done = (await send(`retrospectives/${assignment.id}/complete`, {})).data;
  assert.equal(done.assignmentPending, null);
  assert.deepEqual((await send("retrospectives/current")).data.openAssignments, []);
  assert.equal((await send(`story-cards/${card.cardId}`)).data.type, "ASSIGNMENT");
});
