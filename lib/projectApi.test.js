import assert from "node:assert/strict";
import test from "node:test";
import { apiRequest } from "./apiClient.js";
import * as api from "./projectApi.js";
import { createMockBrowser } from "./mock/authTestHelpers.js";
import { createMockProjectFetch } from "./mock/projectApi.js";

async function setup(options = {}) {
  const browser = createMockBrowser();
  await browser.send("auth/demo", {});
  const fetcher = createMockProjectFetch({ storage: browser.storage, ...options });
  const request = (path, opts) => apiRequest(path, { ...opts, baseUrl: "https://mock.test", fetcher });
  const project = await api.createProject({ name: "검증 프로젝트", roles: ["FRONTEND"] }, { request });
  const tags = await api.getProjectCompetencies({ request });
  return { browser, request, project, competencyIds: [tags[0].id] };
}
test("DRAFT는 목록에 없고 저장시 카드 1장, 수정·카드 삭제는 연결된 기록에 반영된다", async () => {
  const { request, project, competencyIds } = await setup();
  const options = { request };
  const draft = await api.createProjectRecord(project.projectId, { aiOrganize: true, memo: "회의 메모" }, options);
  assert.equal(draft.status, "DRAFT"); assert.equal(draft.cardId, null);
  assert.equal((await api.getProject(project.projectId, options)).recordCount, 0);
  const saved = await api.updateProjectRecord(draft.recordId, { did: "내가 구현함", competencyIds, isAiOrganized: true }, options);
  const card = await api.getProjectCard(saved.cardId, options);
  assert.equal(card.title, "내가 구현함");
  await api.updateProjectCard(card.cardId, { title: "고정 제목", learned: "배운 점", action: "카드만 변경" }, options);
  assert.equal((await api.getProject(project.projectId, options)).records[0].did, "내가 구현함");
  await api.updateProjectRecord(saved.recordId, { did: "기록 수정", concern: "문제", result: "반응" }, options);
  const updated = await api.getProjectCard(card.cardId, options);
  assert.equal(updated.title, "고정 제목"); assert.equal(updated.learned, "배운 점"); assert.equal(updated.action, "기록 수정");
  assert.match(updated.fullMarkdown, /기록 수정/);
  assert.equal((await api.listProjects(options)).inProgressProjects[0].recordCount, 1);
  assert.equal((await api.getProjectHome(options)).inProgressProjects[0].recordCount, 1);
  await api.deleteProjectCard(card.cardId, options);
  assert.equal((await api.getProject(project.projectId, options)).recordCount, 0);
  await assert.rejects(api.getProjectCard(card.cardId, options), { status: 404 });
});
test("빈 자료·역량 한도·다른 파트 역량 검증", async () => {
  const { request, project, competencyIds } = await setup(); const options = { request };
  for (const body of [{ aiOrganize: true }, { aiOrganize: false, memo: "메모만" }]) {
    await assert.rejects(api.createProjectRecord(project.projectId, body, options), { status: 400, code: "EMPTY_MATERIAL" });
  }
  for (const ids of [[], [999], [1, 2, 3, 4], [1, 1]]) {
    await assert.rejects(api.createProjectRecord(project.projectId, { aiOrganize: false, did: "작업", competencyIds: ids }, options), { code: "COMPETENCY_LIMIT" });
  }
  const saved = await api.createProjectRecord(project.projectId, { aiOrganize: false, did: "작업", competencyIds }, options);
  await assert.rejects(api.updateProjectRecord(saved.recordId, { did: " " }, options), { code: "EMPTY_MATERIAL" });
  assert.equal((await api.getProject(project.projectId, options)).records[0].did, "작업");
});
test("답변·건너뛰기·재조회 보존과 잠정 memo 수정·재생성, 정리는 저장하지 않는다", async () => {
  const { request, project } = await setup(); const options = { request };
  const record = await api.createProjectRecord(project.projectId, { aiOrganize: true, memo: "처음 메모" }, options);
  const { questions } = await api.getRecordQuestions(record.recordId, options);
  await api.saveQuestionAnswer(questions[0].questionId, { status: "ANSWERED", answer: "직접 작성" }, options);
  const again = await api.getRecordQuestions(record.recordId, options);
  assert.equal(again.questions[0].answer, "직접 작성");
  await api.saveQuestionAnswer(questions[0].questionId, { status: "SKIPPED" }, options);
  assert.equal((await api.getRecordQuestions(record.recordId, options)).questions[0].answer, null);
  await api.updateProjectRecord(record.recordId, { memo: "바뀐 메모" }, options);
  assert.equal((await api.getRecordQuestions(record.recordId, options)).questions[0].questionId, questions[0].questionId);
  const fresh = await api.getRecordQuestions(record.recordId, { ...options, regenerate: true });
  assert.notEqual(fresh.questions[0].questionId, questions[0].questionId); assert.equal(fresh.questions[0].quote, "바뀐 메모");
  await assert.rejects(api.saveQuestionAnswer(questions[0].questionId, { status: "ANSWERED", answer: "늦은 답" }, options), { status: 404 });
  await api.saveQuestionAnswer(fresh.questions[0].questionId, { status: "ANSWERED", answer: "확인된 작업" }, options);
  const organized = await api.organizeProjectRecord(record.recordId, options);
  assert.equal(organized.did, "확인된 작업"); assert.ok(organized.blanks.includes("result"));
  assert.equal((await api.getProject(project.projectId, options)).recordCount, 0);
});
test("파일 multipart·전체 URL·첨부 상태·삭제·pending 검증", async () => {
  let time = Date.now();
  const { request, project } = await setup({ now: () => time }); const options = { request };
  const file = new File(["회의"], "회의.txt", { type: "text/plain" });
  const attachment = await api.createFileAttachment(file, "MEETING_NOTE", options);
  assert.equal(attachment.name, "회의.txt"); assert.equal(attachment.extractStatus, "PENDING");
  const record = await api.createProjectRecord(project.projectId, { aiOrganize: true, attachmentIds: [attachment.attachmentId] }, options);
  await assert.rejects(api.getRecordQuestions(record.recordId, options), { code: "ATTACHMENT_PENDING" });
  time += 1501;
  assert.equal((await api.getAttachment(attachment.attachmentId, options)).extractStatus, "DONE");
  assert.ok((await api.getRecordQuestions(record.recordId, options)).questions.length);
  const link = await api.createLinkAttachment("https://www.figma.com/design/a?node-id=1-2#anchor", "DESIGN", options);
  assert.equal(link.extractStatus, "SKIPPED"); assert.match(link.url, /\?node-id=1-2#anchor$/);
  await assert.rejects(api.createFileAttachment(new File(["bad"], "bad.svg"), "DESIGN", options), { status: 415 });
  await assert.rejects(api.createLinkAttachment("javascript:alert(1)", "DESIGN", options), { code: "VALIDATION_ERROR" });
  assert.equal(await api.deleteAttachment(link.attachmentId, options), undefined);
  await assert.rejects(api.getAttachment(link.attachmentId, options), { status: 404 });
});
test("포트폴리오는 고른 기록만 사용하고 저장·재저장·완료 후 편집·프로젝트 삭제를 지원한다", async () => {
  const { request, project, competencyIds } = await setup(); const options = { request };
  const a = await api.createProjectRecord(project.projectId, { aiOrganize: false, did: "선택한 작업", competencyIds }, options);
  await api.createProjectRecord(project.projectId, { aiOrganize: false, did: "선택하지 않은 작업", competencyIds }, options);
  const questions = await api.getFinishQuestions(project.projectId, [a.recordId], options);
  const question = questions.questions[0];
  await api.saveQuestionAnswer(question.questionId, { status: "ANSWERED", answer: "내 역할" }, options);
  assert.equal((await api.getFinishQuestions(project.projectId, [a.recordId], options)).questions[0].answer, "내 역할");
  const draft = await api.getPortfolioDraft(project.projectId, [a.recordId], options);
  assert.match(draft.markdown, /선택한 작업/); assert.doesNotMatch(draft.markdown, /선택하지 않은 작업/);
  assert.equal((await api.savePortfolio(project.projectId, draft.markdown, options)).isFirstCompletion, true);
  assert.equal((await api.savePortfolio(project.projectId, "수정한 포트폴리오", options)).isFirstCompletion, false);
  await api.updateProjectRecord(a.recordId, { did: "완료 후 수정" }, options);
  const detail = await api.getProject(project.projectId, options);
  assert.equal(detail.recordCount, 2); assert.equal(detail.portfolio.markdown, "수정한 포트폴리오");
  assert.equal(await api.deleteProject(project.projectId, options), undefined);
  await assert.rejects(api.getProjectCard(a.cardId, options), { status: 404 });
  assert.deepEqual(await api.listProjects(options), { inProgressProjects: [], doneProjects: [] });
});
test("다른 transport에서도 저장 데이터를 복원하고 만료·사용자 격리·DRAFT 24시간 정리", async () => {
  let time = Date.now();
  const { request, project, browser } = await setup({ now: () => time }); const options = { request };
  const draft = await api.createProjectRecord(project.projectId, { aiOrganize: true, memo: "임시" }, options);
  const freshFetch = createMockProjectFetch({ storage: browser.storage, now: () => time });
  const another = (path, opts) => apiRequest(path, { ...opts, baseUrl: "https://mock.test", fetcher: freshFetch });
  assert.equal((await api.getProject(project.projectId, { request: another })).name, project.name);
  time += 86400001;
  await api.getProject(project.projectId, options);
  await assert.rejects(api.getRecordQuestions(draft.recordId, options), { status: 404 });
  const other = createMockProjectFetch({ storage: browser.storage, getUser: async () => ({ id: 9, part: "BACKEND" }) });
  const otherRequest = (path, opts) => apiRequest(path, { ...opts, baseUrl: "https://mock.test", fetcher: other });
  await assert.rejects(api.getProject(project.projectId, { request: otherRequest }), { status: 404 });
  await browser.send("auth/logout", {});
  await assert.rejects(api.listProjects(options), { status: 401 });
});
test("AI 실패·중복·클라이언트 타임아웃·취소는 기존 질문을 보존한다", async () => {
  let behavior = {};
  const { request, project } = await setup({ scenario: () => behavior }); const options = { request };
  const draft = await api.createProjectRecord(project.projectId, { aiOrganize: true, memo: "자료" }, options);
  const original = await api.getRecordQuestions(draft.recordId, options);
  behavior = { error: "AI_TIMEOUT", status: 504 };
  await assert.rejects(api.getRecordQuestions(draft.recordId, { ...options, regenerate: true }), { status: 504, code: "AI_TIMEOUT" });
  behavior = { delayMs: 60 };
  const pending = api.getRecordQuestions(draft.recordId, options);
  await new Promise((resolve) => setTimeout(resolve, 10));
  await assert.rejects(api.getRecordQuestions(draft.recordId, options), { code: "AI_IN_PROGRESS" });
  await pending;
  await assert.rejects(api.getRecordQuestions(draft.recordId, { ...options, timeoutMs: 5, regenerate: true }), { kind: "timeout" });
  const controller = new AbortController();
  const cancelled = api.getRecordQuestions(draft.recordId, { ...options, signal: controller.signal, regenerate: true });
  controller.abort(); await assert.rejects(cancelled, { kind: "aborted" });
  behavior = {};
  assert.equal((await api.getRecordQuestions(draft.recordId, options)).questions[0].questionId, original.questions[0].questionId);
});
test("live 함수는 동일한 경로·JSON·쿠키·FormData를 사용하며 mock 재생성만 잠정 필드다", async (t) => {
  for (const [key, value] of Object.entries({ NEXT_PUBLIC_AUTH_MODE: "live", NEXT_PUBLIC_API_BASE_URL: "https://backend.test" })) {
    const before = process.env[key]; process.env[key] = value;
    t.after(() => { if (before === undefined) delete process.env[key]; else process.env[key] = before; });
  }
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, options) => { requests.push({ url: String(url), ...options }); return Response.json({ success: true, data: { fromServer: true }, error: null }); });
  assert.deepEqual(await api.listProjects(), { fromServer: true });
  await api.updateProjectRecord(7, { memo: "잠정 메모" });
  await api.createFileAttachment(new File(["hi"], "hello.txt"), "OUTPUT");
  assert.equal(requests[0].url, "https://backend.test/api/v1/projects");
  assert.equal(requests[1].credentials, "include"); assert.equal(requests[1].headers.has("Authorization"), false);
  assert.deepEqual(JSON.parse(requests[1].body), { memo: "잠정 메모" });
  assert.ok(requests[2].body instanceof FormData); assert.equal(requests[2].headers.has("Content-Type"), false);
});
