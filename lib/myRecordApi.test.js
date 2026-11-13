import assert from "node:assert/strict";
import test from "node:test";
import { apiRequest } from "./apiClient.js";
import * as api from "./myRecordApi.js";
import * as projects from "./projectApi.js";
import { createMockBrowser } from "./mock/authTestHelpers.js";
import { createMockServerFetch } from "./mock/server.js";
import { cardView } from "./projectViewModel.js";
import { footprintView } from "./myRecordViewModel.js";
import { saveMockWeek } from "./mock/myRecordModel.js";

async function setup() {
  const browser = createMockBrowser();
  await browser.send("auth/demo", {});
  const fetcher = createMockServerFetch({ storage: browser.storage });
  const request = (path, options) => apiRequest(path, { ...options, baseUrl: "https://mock.test", fetcher });
  return { browser, request };
}
test("39주 상태와 카드 ID를 유지하며 삭제 후에도 완료 상태가 남는다", async () => {
  const { request } = await setup(); const opts = { request };
  const footprints = await api.getFootprints(opts);
  assert.equal(footprints.weeks.length, 39);
  assert.deepEqual(new Set(footprints.weeks.map((w) => w.status)), new Set(["COMPLETED", "NO_RECORD", "THIS_WEEK", "UPCOMING"]));
  const week = footprints.weeks.find((w) => w.weekNumber === 1);
  for (const id of week.cardIds) await api.deleteStoryCard(id, opts);
  const after = (await api.getFootprints(opts)).weeks[0];
  assert.equal(after.status, "COMPLETED"); assert.deepEqual(after.cardIds, []);
  const view = footprintView(footprints);
  assert.equal(view.currentWeek, 35); assert.equal(view.weeks[38].title, null);
});
test("유형·주차·역량·근거 검색의 교집합과 전체 역량 수", async () => {
  const { request } = await setup(); const opts = { request };
  const all = await api.getStoryCards({}, opts);
  const card = (await api.getStoryCards({ type: "ASSIGNMENT" }, opts)).cards[0];
  const result = await api.getStoryCards({ type: card.type, weekNumber: card.weekNumber, competencyId: card.competencies[0].id, q: card.evidenceSummary[0] }, opts);
  assert.ok(result.cards.some((c) => c.cardId === card.cardId));
  assert.ok(result.cards.every((c) => c.type === card.type && c.weekNumber === card.weekNumber));
  assert.equal((await api.getStoryCards({ q: "일치하지 않는 검색어" }, opts)).totalCount, 0);
  const tags = await api.getCompetencies(opts);
  for (const tag of tags) assert.equal(tag.cardCount, all.cards.filter((c) => c.competencies.some((t) => t.id === tag.id)).length);
  const view = cardView(await api.getStoryCard(card.cardId, opts));
  assert.equal(view.type, "assignment"); assert.equal(view.whenLabel, `${card.weekNumber}주차`);
});
test("회고·프로젝트 카드가 같은 저장소에서 수정·삭제되고 오류 계약을 유지한다", async () => {
  const { request } = await setup(); const opts = { request };
  const tags = await api.getCompetencies(opts);
  const first = (await api.getStoryCards({ type: "SESSION" }, opts)).cards[0];
  const updated = await api.updateStoryCard(first.cardId, { title: "응답 제목", reason: "직접 채움", competencyIds: [tags[0].id] }, opts);
  assert.equal(updated.title, "응답 제목"); assert.equal(updated.reason, "직접 채움");
  await assert.rejects(api.updateStoryCard(first.cardId, { competencyIds: [] }, opts), { code: "COMPETENCY_LIMIT" });
  const project = await projects.createProject({ name: "테스트", roles: ["FRONTEND"] }, opts);
  const record = await projects.createProjectRecord(project.projectId, { aiOrganize: false, did: "구현", competencyIds: [tags[0].id] }, opts);
  assert.equal((await api.getStoryCards({ type: "PROJECT" }, opts)).totalCount, 1);
  await api.deleteStoryCard(record.cardId, opts);
  assert.equal((await projects.getProject(project.projectId, opts)).recordCount, 0);
  await assert.rejects(api.getStoryCard(record.cardId, opts), { status: 404 });
});
test("API 목록은 허용된 필터만 보내고 취소 신호를 전달한다", async () => {
  const controller = new AbortController(); let call;
  await api.getStoryCards({ type: "SESSION", q: "", weekNumber: 1, uiOnly: true }, {
    signal: controller.signal, request: async (path, options) => { call = { path, ...options }; },
  });
  assert.equal(call.path, "/story-cards"); assert.deepEqual(call.query, { type: "SESSION", weekNumber: 1 });
  assert.equal(call.signal, controller.signal);
});

test("기존 회고 Mock 저장·초기화가 API 카드와 이번 주 상태에 이어진다", async () => {
  const { browser, request } = await setup(); const opts = { request };
  const user = await apiRequest("/users/me", { baseUrl: "https://mock.test", fetcher: browser.fetch });
  const card = { id: "card-35", type: "session", week: 35, title: "저장 회고", tags: ["협업"], summary: { learned: "배움" }, document: "# 회고", evidence: "입력 메모" };
  saveMockWeek(browser.storage, user, card);
  assert.equal((await api.getStoryCard(card.id, opts)).title, card.title);
  const current = (await api.getFootprints(opts)).weeks[34];
  assert.equal(current.status, "COMPLETED"); assert.equal(current.isCurrent, true);
  saveMockWeek(browser.storage, user, null, 35);
  assert.equal((await api.getFootprints(opts)).weeks[34].status, "THIS_WEEK");
  await assert.rejects(api.getStoryCard(card.id, opts), { status: 404 });
});

test("목록과 독립적인 직접 상세 조회는 전문·빈칸·근거를 반환하고 잘못된 카드는 404다", async () => {
  const { request } = await setup(); const opts = { request };
  const empty = await api.getStoryCards({ type: "PROJECT", q: "다른 조건" }, opts);
  assert.equal(empty.totalCount, 0);
  const detail = await api.getStoryCard("card-29", opts);
  const view = cardView(detail);
  assert.equal(view.document, detail.fullMarkdown);
  assert.equal(view.summary.reason, detail.reason ?? "");
  assert.equal(view.evidence, detail.evidenceSummary.join(" · "));
  assert.equal(view.type, detail.type.toLowerCase());
  await assert.rejects(api.getStoryCard("없는-ID", opts), { status: 404 });
});

test("수정 실패·취소는 저장 내용을 보존하고 삭제 성공 후 역량 수와 연결만 줄어든다", async () => {
  const { browser, request } = await setup(); const opts = { request };
  const original = await api.getStoryCard("card-29", opts);
  await assert.rejects(api.updateStoryCard(original.cardId, { title: "실패 제목", competencyIds: [] }, opts), { status: 400 });
  assert.equal((await api.getStoryCard(original.cardId, opts)).title, original.title);
  const fetcher = createMockServerFetch({ storage: browser.storage, scenario: () => ({ delayMs: 80 }) });
  const slow = (path, options) => apiRequest(path, { ...options, baseUrl: "https://mock.test", fetcher });
  const controller = new AbortController();
  const pending = api.updateStoryCard(original.cardId, { title: "취소 제목" }, { request: slow, signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, { code: "ABORTED" });
  assert.equal((await api.getStoryCard(original.cardId, opts)).title, original.title);
  const before = await api.getCompetencies(opts);
  assert.equal(await api.deleteStoryCard(original.cardId, opts), undefined);
  const after = await api.getCompetencies(opts);
  for (const tag of before) {
    assert.equal(after.find((item) => item.id === tag.id).cardCount,
      tag.cardCount - (original.competencies.some((item) => item.id === tag.id) ? 1 : 0));
  }
  const week = (await api.getFootprints(opts)).weeks.find((item) => item.weekNumber === original.weekNumber);
  assert.equal(week.status, "COMPLETED"); assert.ok(!week.cardIds.includes(original.cardId));
});
