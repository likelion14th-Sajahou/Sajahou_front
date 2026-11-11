import assert from "node:assert/strict";
import test from "node:test";
import { apiRequest } from "./apiClient.js";
import { getProjectHome } from "./projectApi.js";
import { getFootprints, getStoryCards } from "./myRecordApi.js";
import { createMockBrowser } from "./mock/authTestHelpers.js";
import { createMockServerFetch, MOCK_STORAGE_PREFIX } from "./mock/server.js";

async function setup() {
  const browser = createMockBrowser();
  await browser.send("auth/demo", {});
  const fetcher = createMockServerFetch({ storage: browser.storage });
  const options = { request: (path, options) => apiRequest(path, { ...options, baseUrl: "https://mock.test", fetcher }) };
  await getProjectHome(options);
  const { data: user } = await (await browser.send("users/me")).json();
  const key = `${MOCK_STORAGE_PREFIX}${user.id}`;
  const update = (change) => {
    const state = JSON.parse(browser.storage.getItem(key));
    change(state);
    browser.storage.setItem(key, JSON.stringify(state));
  };
  return { options, update };
}

test("홈 스티커는 발자취의 완료 주차와 같고 최근 10개·전체 개수를 구분한다", async () => {
  const { options } = await setup();
  const home = await getProjectHome(options);
  const footprints = await getFootprints(options);
  const weeks = footprints.weeks.filter((week) => week.status === "COMPLETED").map((week) => week.weekNumber).sort((a, b) => b - a);
  assert.equal(home.stickers.totalCount, weeks.length);
  assert.deepEqual(home.stickers.recentWeekNumbers, weeks.slice(0, 10));
  assert.deepEqual(home.stickers.projectStickers, []);
});

test("홈 최근 카드는 공개된 세션·과제 최대 3개이며 카드 목록 순서를 따른다", async () => {
  const { options, update } = await setup();
  update((state) => {
    const template = Object.values(state.cards)[0];
    state.cards[9991] = { ...template, cardId: 9991, type: "PROJECT", weekNumber: 39 };
    state.cards[9992] = { ...template, cardId: 9992, status: "DRAFT", weekNumber: 39 };
  });
  const home = await getProjectHome(options);
  const list = await getStoryCards({}, options);
  assert.deepEqual(home.recentCards.map((card) => card.cardId), list.cards.filter((card) => card.type !== "PROJECT").slice(0, 3).map((card) => card.cardId));
  assert.ok(home.recentCards.length <= 3);
});

test("빈 저장소의 홈은 정상 빈 목록을 반환한다", async () => {
  const { options, update } = await setup();
  update((state) => { state.cards = {}; state.projects = {}; state.completedWeeks = []; });
  const home = await getProjectHome(options);
  assert.deepEqual(home.recentCards, []);
  assert.deepEqual(home.inProgressProjects, []);
  assert.deepEqual(home.doneProjects, []);
  assert.equal(home.stickers.totalCount, 0);
  assert.equal(home.sessionRetrospective.state, "NOT_STARTED");
  assert.equal(home.stickers.showThisWeekSlot, true);
});
