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
test("기록 PATCH는 null·누락 시 유지하고 빈 문자열이면 메모와 5칸을 비운다", async () => {
  const { request, project, competencyIds } = await setup();
  const options = { request };
  const attachment = await api.createLinkAttachment("https://example.com", "OUTPUT", options);
  const fields = { memo: "메모", did: "한 일", concern: "고민", decision: "선택", result: "결과", nextStep: "다음" };
  const saved = await api.createProjectRecord(project.projectId, {
    aiOrganize: false, ...fields, competencyIds, attachmentIds: [attachment.attachmentId],
  }, options);
  const unchanged = await api.updateProjectRecord(saved.recordId, Object.fromEntries(Object.keys(fields).map((key) => [key, null])), options);
  const omitted = await api.updateProjectRecord(saved.recordId, {}, options);
  for (const [key, value] of Object.entries(fields)) {
    assert.equal(unchanged[key], value);
    assert.equal(omitted[key], value);
  }
  await api.updateProjectRecord(saved.recordId, Object.fromEntries(Object.keys(fields).map((key) => [key, ""])), options);
  const reloaded = (await api.getProject(project.projectId, options)).records[0];
  for (const key of Object.keys(fields)) assert.ok(!reloaded[key], `${key}가 비워져야 한다`);
  assert.equal(reloaded.attachments[0].attachmentId, attachment.attachmentId);
  assert.deepEqual(reloaded.competencies, saved.competencies);
  const card = await api.getProjectCard(saved.cardId, options);
  for (const key of ["situation", "action", "reason", "result"]) assert.ok(!card[key]);
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

test("카드 태그 수정은 원본 기록을 유지하고 기록 수정은 원본 태그로 카드를 갱신한다", async () => {
  const { request, project, browser } = await setup(); const options = { request };
  const tags = await api.getProjectCompetencies(options);
  const saved = await api.createProjectRecord(project.projectId, { aiOrganize: false, did: "원본 행동", competencyIds: [tags[0].id] }, options);
  await api.updateProjectCard(saved.cardId, { competencyIds: [tags[1].id], title: "카드 제목", learned: "배운 점" }, options);
  assert.deepEqual((await api.getProject(project.projectId, options)).records[0].competencies, saved.competencies);
  assert.equal((await api.getProjectCard(saved.cardId, options)).competencies[0].id, tags[1].id);
  const restoredFetch = createMockProjectFetch({ storage: browser.storage });
  const restored = { request: (path, opts) => apiRequest(path, { ...opts, baseUrl: "https://mock.test", fetcher: restoredFetch }) };
  assert.deepEqual((await api.getProject(project.projectId, restored)).records[0].competencies, saved.competencies);
  await api.updateProjectRecord(saved.recordId, { result: "원본 결과 추가" }, restored);
  const card = await api.getProjectCard(saved.cardId, restored);
  assert.deepEqual(card.competencies, saved.competencies);
  assert.equal(card.title, "카드 제목"); assert.equal(card.learned, "배운 점");
  await api.updateProjectRecord(saved.recordId, { competencyIds: [tags[2].id] }, restored);
  assert.equal((await api.getProject(project.projectId, restored)).records[0].competencies[0].id, tags[2].id);
  assert.equal((await api.getProjectCard(saved.cardId, restored)).competencies[0].id, tags[2].id);
});

test("기록 태그가 없는 이전 mock 저장소도 삭제 없이 복원하고 이후 카드 태그와 분리한다", async () => {
  const { request, project, browser, competencyIds } = await setup(); const options = { request };
  const saved = await api.createProjectRecord(project.projectId, { aiOrganize: false, did: "이전 기록", competencyIds }, options);
  const key = `sajarok_mock_projects_v1:${(await (await browser.send("users/me")).json()).data.id}`;
  const state = JSON.parse(browser.storage.getItem(key));
  delete state.records[saved.recordId].competencies;
  browser.storage.setItem(key, JSON.stringify(state));
  const tags = await api.getProjectCompetencies(options);
  await api.updateProjectCard(saved.cardId, { competencyIds: [tags[1].id] }, options);
  const loaded = await api.getProject(project.projectId, options);
  assert.equal(loaded.recordCount, 1); assert.deepEqual(loaded.records[0].competencies, saved.competencies);
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

test("프로젝트 401은 현재 세션에만 알리고 다른 오류·취소·이전 세션의 지연 응답은 무시한다", async (t) => {
  const previousMode = process.env.NEXT_PUBLIC_AUTH_MODE;
  process.env.NEXT_PUBLIC_AUTH_MODE = "live";
  t.after(() => { if (previousMode === undefined) delete process.env.NEXT_PUBLIC_AUTH_MODE; else process.env.NEXT_PUBLIC_AUTH_MODE = previousMode; });
  const errorResponse = (status) => Response.json({ success: false, data: null, error: { code: status === 401 ? "UNAUTHORIZED" : "INTERNAL_ERROR", message: "요청 실패" } }, { status });
  let notices = 0;
  const stop = api.subscribeProjectUnauthorized(() => { notices++; }); t.after(stop);
  const options = { baseUrl: "https://backend.test", fetcher: async () => errorResponse(401) };
  await assert.rejects(api.projectRequest("/projects", options), { status: 401 });
  assert.equal(notices, 1);
  await assert.rejects(api.projectRequest("/projects", { ...options, fetcher: async () => errorResponse(500) }), { status: 500 });
  assert.equal(notices, 1);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(api.projectRequest("/projects", { ...options, signal: controller.signal }), { kind: "aborted" });
  assert.equal(notices, 1);
  let resolveResponse;
  const pendingResponse = new Promise((resolve) => { resolveResponse = resolve; });
  const pending = api.projectRequest("/projects", { ...options, fetcher: () => pendingResponse });
  stop();
  let newSessionNotices = 0;
  const stopNew = api.subscribeProjectUnauthorized(() => { newSessionNotices++; }); t.after(stopNew);
  resolveResponse(errorResponse(401));
  await assert.rejects(pending, { status: 401 });
  assert.equal(notices, 1); assert.equal(newSessionNotices, 0);
  await assert.rejects(api.projectRequest("/projects", options), { status: 401 });
  assert.equal(newSessionNotices, 1);
});

test("H-13 첨부 종류에 따라 질문을 고르고 근거와 숫자는 항상 포함한다", async () => {
  const { request, project } = await setup(); const options = { request };
  const design = await api.createLinkAttachment("https://figma.com/design/demo", "DESIGN", options);
  const record = await api.createProjectRecord(project.projectId, { aiOrganize: true, attachmentIds: [design.attachmentId] }, options);
  const { questions } = await api.getRecordQuestions(record.recordId, options);
  assert.ok(questions.length <= 4);
  assert.ok(questions.some((q) => q.tag === "선택의 이유"));
  assert.ok(questions.some((q) => q.tag === "근거와 숫자"));
  assert.equal(questions.some((q) => q.tag === "내 역할·과정"), false);
});

test("첨부 하나당 선택한 종류 하나를 저장하고 조회·기록 연결·개별 삭제에서도 유지한다", async () => {
  let time = Date.now();
  const { request, project, competencyIds } = await setup({ now: () => time }); const options = { request };
  const meeting = await api.createFileAttachment(new File(["회의"], "회의.pdf", { type: "application/pdf" }), "MEETING_NOTE", options);
  const presentation = await api.createFileAttachment(new File(["발표"], "발표.pdf", { type: "application/pdf" }), "PRESENTATION", options);
  const design = await api.createFileAttachment(new File(["이미지"], "화면.png", { type: "image/png" }), "DESIGN", options);
  const items = [meeting, presentation, design];
  assert.equal(new Set(items.map((a) => a.attachmentId)).size, 3);
  time += 1501;
  for (const item of items) {
    const loaded = await api.getAttachment(item.attachmentId, options);
    assert.equal(loaded.category, item.category); assert.equal(loaded.name, item.name); assert.equal(loaded.extractStatus, "DONE");
  }
  await api.deleteAttachment(meeting.attachmentId, options);
  assert.equal((await api.getAttachment(presentation.attachmentId, options)).category, "PRESENTATION");
  const record = await api.createProjectRecord(project.projectId, { aiOrganize: false, attachmentIds: [presentation.attachmentId, design.attachmentId], competencyIds }, options);
  assert.deepEqual(record.attachments.map((a) => [a.name, a.category]), [["발표.pdf", "PRESENTATION"], ["화면.png", "DESIGN"]]);
  assert.deepEqual((await api.getProject(project.projectId, options)).records[0].attachments.map((a) => a.category), ["PRESENTATION", "DESIGN"]);
});

test("파일 업로드는 여러 파일이나 여러 category를 한 요청에 넣으면 거부한다", async () => {
  const { request } = await setup();
  const file = new File(["자료"], "자료.txt");
  for (const [files, categories] of [[2, 1], [1, 2], [0, 1]]) {
    const body = new FormData();
    for (let i = 0; i < files; i++) body.append("file", file);
    for (let i = 0; i < categories; i++) body.append("category", "MEETING_NOTE");
    await assert.rejects(request("/attachments/files", { method: "POST", body }), { status: 400, code: "VALIDATION_ERROR" });
  }
});
