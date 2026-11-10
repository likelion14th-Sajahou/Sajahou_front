import assert from "node:assert/strict";
import test from "node:test";
import { apiRequest } from "./apiClient.js";
import * as api from "./matchingApi.js";
import * as attachmentApi from "./attachmentApi.js";
import { getStoryCards } from "./myRecordApi.js";
import { createMockBrowser } from "./mock/authTestHelpers.js";
import { MATCHING_SAMPLE } from "./mock/matching.js";
import { MOCK_STORAGE_PREFIX, createMockServerFetch } from "./mock/server.js";

// 데모 계정(기획·디자인 파트, 시드 스토리 카드)으로 자소서 매칭 API를 부른다.
async function setup(options = {}) {
  const browser = createMockBrowser();
  await browser.send("auth/demo", {});
  const fetcher = createMockServerFetch({ storage: browser.storage, ...options });
  const request = (path, opts) => apiRequest(path, { ...opts, baseUrl: "https://mock.test", fetcher });
  return { browser, request, options: { request } };
}

const SAMPLE_POSTING = {
  company: MATCHING_SAMPLE.company, department: MATCHING_SAMPLE.role, postingText: null,
  jd: MATCHING_SAMPLE.jd, preferredQualification: MATCHING_SAMPLE.preferences, companyInfo: MATCHING_SAMPLE.companyInfo,
  attachmentIds: [], questions: MATCHING_SAMPLE.questions.map((content) => ({ content, charLimit: null })),
};

test("로그인하지 않으면 401을 돌려준다", async () => {
  const fetcher = createMockServerFetch({ storage: createMockBrowser().storage });
  const request = (path, opts) => apiRequest(path, { ...opts, baseUrl: "https://mock.test", fetcher });
  await assert.rejects(api.createJobPosting(SAMPLE_POSTING, { request }), { status: 401 });
});

test("36. 공고에서 고정 목록 역량을 찾고, 카드 수는 나의 사자록 역량 필터 결과와 같다", async () => {
  const { options } = await setup();
  const created = await api.createJobPosting(SAMPLE_POSTING, options);
  assert.equal(created.noCompetencyFound, false);
  assert.deepEqual(created.competencies.map(({ name }) => name),
    ["사용자 리서치", "문제 정의", "UX 설계", "UI 디자인", "근거 기반 설계", "자기주도 학습", "협업", "갈등 조율"]);
  for (const competency of created.competencies) {
    const { totalCount } = await getStoryCards({ competencyId: competency.competencyId }, options);
    assert.equal(competency.cardCount, totalCount, `${competency.name} 카드 수`);
    assert.ok(competency.evidenceQuote && !competency.evidenceQuote.startsWith("-"));
  }
  assert.equal(created.questions.length, 3);
  assert.deepEqual(created.questions.map(({ seq }) => seq), [1, 2, 3]);
  assert.ok(created.questions.every(({ competencyIds }) => competencyIds.length >= 1 && competencyIds.length <= 3));
});

test("36. 문항이 없거나 공고 내용이 모두 비면 실행하지 않는다", async () => {
  const { options } = await setup();
  await assert.rejects(api.createJobPosting({ ...SAMPLE_POSTING, questions: [] }, options), { status: 400, code: "VALIDATION_ERROR" });
  await assert.rejects(api.createJobPosting({ ...SAMPLE_POSTING, questions: [{ content: "  " }] }, options), { code: "VALIDATION_ERROR" });
  const empty = { ...SAMPLE_POSTING, jd: " ", preferredQualification: null, companyInfo: "" };
  await assert.rejects(api.createJobPosting(empty, options), { status: 400, code: "EMPTY_MATERIAL" });
  const result = await api.createJobPosting({ ...empty, jd: "주요 업무: 백엔드 개발" }, options);
  assert.equal(result.noCompetencyFound, true);
  assert.deepEqual(result.competencies, []);
});

test("36. 공고 첨부: 읽는 중이면 409, 읽지 못한 링크만 있으면 EMPTY_MATERIAL, 다른 종류 첨부는 400", async () => {
  let time = Date.now();
  const { options } = await setup({ now: () => time, scenario: ({ path }) => (path === "/attachments/links" ? { extractStatus: "FAILED" } : {}) });
  const noText = { ...SAMPLE_POSTING, jd: null, preferredQualification: null, companyInfo: null };
  const link = await attachmentApi.createLinkAttachment("https://www.saramin.co.kr/jobs/1", "JOB_POSTING", options);
  await assert.rejects(api.createJobPosting({ ...noText, attachmentIds: [link.attachmentId] }, options), { status: 409, code: "ATTACHMENT_PENDING" });
  time += 1501;
  assert.equal((await attachmentApi.getAttachment(link.attachmentId, options)).extractStatus, "FAILED");
  await assert.rejects(api.createJobPosting({ ...noText, attachmentIds: [link.attachmentId] }, options), { code: "EMPTY_MATERIAL" });

  const file = await attachmentApi.createFileAttachment(new File(["공고"], "공고.pdf", { type: "application/pdf" }), "JOB_POSTING", options);
  time += 1501;
  await attachmentApi.getAttachment(file.attachmentId, options);
  const created = await api.createJobPosting({ ...noText, attachmentIds: [link.attachmentId, file.attachmentId] }, options);
  assert.ok(created.competencies.length > 0);

  const other = await attachmentApi.createLinkAttachment("https://example.com", "OUTPUT", options);
  await assert.rejects(api.createJobPosting({ ...SAMPLE_POSTING, attachmentIds: [other.attachmentId] }, options), { code: "VALIDATION_ERROR" });
  await assert.rejects(api.createJobPosting({ ...SAMPLE_POSTING, attachmentIds: [99999] }, options), { code: "VALIDATION_ERROR" });

  // 첨부를 지우면 39번 조회의 공고 첨부에서도 빠진다.
  const before = await api.getJobPosting(created.jobPostingId, options);
  assert.deepEqual(before.attachments.map(({ type }) => type), ["LINK", "FILE"]);
  assert.equal(before.attachments[0].url, "https://www.saramin.co.kr/jobs/1");
  assert.equal(before.attachments[1].name, "공고.pdf");
  await attachmentApi.deleteAttachment(file.attachmentId, options);
  assert.deepEqual((await api.getJobPosting(created.jobPostingId, options)).attachments.map(({ attachmentId }) => attachmentId), [link.attachmentId]);
});

test("37. 카드에 있는 내용만 쓰고 없는 칸은 빈칸으로 남기며, 출처 카드 ①②와 공고 ③을 표시한다", async () => {
  const { options } = await setup();
  const created = await api.createJobPosting(SAMPLE_POSTING, options);
  const answer = await api.createAnswerDraft(created.questions[0].questionId, options);
  assert.equal(answer.noMatchingCard, false);
  assert.deepEqual(answer.cards.map(({ no, role }) => [no, role]), [[1, "MAIN"], [2, "SUB"]]);
  const blanks = answer.segments.filter(({ type }) => type === "blank");
  assert.equal(answer.blankCount, blanks.length);
  assert.ok(blanks.every(({ slot, hint }) => slot && hint));
  const texts = answer.segments.filter(({ type }) => type === "text");
  assert.equal(answer.charCount, texts.map(({ text }) => text).join(" ").length);
  assert.deepEqual([...new Set(texts.map(({ source }) => source))].sort(), [1, 2, 3]);
  assert.equal(answer.usesJobPosting, true);
  // 근거가 많은 카드(29주차 과제)가 앞에 와서, 그 카드의 실제 문장이 그대로 들어간다.
  const main = answer.cards[0];
  assert.match(answer.segments.map((segment) => segment.text ?? "").join(" "), new RegExp(main.title.slice(0, 6)));
});

test("37. 맞는 카드가 없으면 초안 없이 noMatchingCard와 없는 역량을 돌려준다", async () => {
  const { browser, options } = await setup();
  const created = await api.createJobPosting(SAMPLE_POSTING, options);
  // 이 사용자의 카드를 모두 지운다.
  const key = `${MOCK_STORAGE_PREFIX}2`;
  const state = JSON.parse(browser.storage.getItem(key));
  state.cards = {};
  browser.storage.setItem(key, JSON.stringify(state));
  const answer = await api.createAnswerDraft(created.questions[1].questionId, options);
  assert.equal(answer.noMatchingCard, true);
  assert.deepEqual(answer.segments, []);
  assert.deepEqual(answer.cards, []);
  assert.deepEqual(answer.missingCompetencies.map(({ competencyId }) => competencyId), created.questions[1].competencyIds);
  assert.ok(answer.missingCompetencies.every(({ name }) => name));
});

test("38·39. 고친 답 저장·되돌리기, 초안을 다시 만들면 고친 답을 비운다", async () => {
  const { options } = await setup();
  const created = await api.createJobPosting(SAMPLE_POSTING, options);
  const { questionId } = created.questions[0];
  await assert.rejects(api.saveEditedAnswer(questionId, "고친 답", options), { status: 409, code: "INVALID_STATE" });
  let loaded = await api.getJobPosting(created.jobPostingId, options);
  assert.equal(loaded.company, MATCHING_SAMPLE.company);
  assert.equal(loaded.questions[0].answer, null);

  const draft = await api.createAnswerDraft(questionId, options);
  const saved = await api.saveEditedAnswer(questionId, "중커톤에서 [결과 · 채워 주세요] 팀 API 연동을 맡았습니다.", options);
  assert.equal(saved.charCount, "중커톤에서  팀 API 연동을 맡았습니다.".length);
  loaded = await api.getJobPosting(created.jobPostingId, options);
  assert.equal(loaded.questions[0].editedAnswer, saved.editedAnswer);
  assert.deepEqual(loaded.questions[0].answer, draft);

  const reverted = await api.saveEditedAnswer(questionId, null, options);
  assert.deepEqual(reverted, { questionId, editedAnswer: null, charCount: draft.charCount });
  await assert.rejects(api.saveEditedAnswer(questionId, " ", options), { code: "VALIDATION_ERROR" });

  await api.saveEditedAnswer(questionId, "다시 고친 답", options);
  await api.createAnswerDraft(questionId, options);
  assert.equal((await api.getJobPosting(created.jobPostingId, options)).questions[0].editedAnswer, null);
  await assert.rejects(api.getJobPosting(999999, options), { status: 404 });
  await assert.rejects(api.createAnswerDraft(999999, options), { status: 404 });
});

test("39. 답에 쓴 카드를 지우면 '이 답에 쓴 기록'에서 빠진다", async () => {
  const { request, options } = await setup();
  const created = await api.createJobPosting(SAMPLE_POSTING, options);
  const { questionId } = created.questions[0];
  const draft = await api.createAnswerDraft(questionId, options);
  await request(`/story-cards/${encodeURIComponent(draft.cards[1].cardId)}`, { method: "DELETE" });
  const loaded = await api.getJobPosting(created.jobPostingId, options);
  assert.deepEqual(loaded.questions[0].answer.cards.map(({ no }) => no), [1]);
});
