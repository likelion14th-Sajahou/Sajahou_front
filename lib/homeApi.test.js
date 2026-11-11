import assert from "node:assert/strict";
import test from "node:test";
import { apiRequest } from "./apiClient.js";
import { createProject, getProject, getProjectHome } from "./projectApi.js";
import { roleCodes } from "./projectViewModel.js";
import { getFootprints, getStoryCards } from "./myRecordApi.js";
import { createMockBrowser } from "./mock/authTestHelpers.js";
import { createMockServerFetch, MOCK_STORAGE_PREFIX } from "./mock/server.js";
import { HOME_HERO_CONTENT, homeStickers } from "./homeViewModel.js";

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
  assert.deepEqual(home.stickers.projectStickers, ["IDEATHON", "HACKATHON"]);
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

test("네 회고 상태는 홈·이번 주 빈 자리·히어로 문구에 같은 기준으로 반영된다", async () => {
  const { options, update } = await setup();
  const initial = await getProjectHome(options);
  for (const [state, cta] of [["NOT_STARTED", "회고 쓰기"], ["IN_PROGRESS", "이어 쓰기"], ["COMPLETED", "다시 보기"], ["RESTED", "이번 주 보기"]]) {
    update((store) => {
      store.retrospectives = state === "NOT_STARTED" ? {} : { 101: { id: 101, weekId: initial.currentWeek.weekId, type: "SESSION", state } };
    });
    const home = await getProjectHome(options);
    assert.equal(home.sessionRetrospective.state, state);
    assert.equal(home.sessionRetrospective.id, state === "NOT_STARTED" ? null : 101);
    assert.equal(home.stickers.showThisWeekSlot, !["COMPLETED", "RESTED"].includes(state));
    assert.equal(HOME_HERO_CONTENT[state].cta, cta);
    assert.equal(HOME_HERO_CONTENT[state].title, state === "RESTED" ? "이번 주는\n쉬어 가는 주예요" : "이번 주 이야기를\n남겨 볼까요");
  }
});

test("프로젝트 생성은 역할 코드·null 부제목을 저장하고 응답 ID로 상세와 홈을 조회할 수 있다", async () => {
  const { options } = await setup();
  const created = await createProject({ name: "홈에서 만든 프로젝트", subtitle: null, roles: roleCodes(["PM", "기획", "백엔드"]) }, options);
  const detail = await getProject(created.projectId, options);
  assert.equal(detail.name, "홈에서 만든 프로젝트");
  assert.equal(detail.subtitle, null);
  assert.deepEqual(detail.roles, ["PM", "PLANNING", "BACKEND"]);
  const home = await getProjectHome(options);
  assert.ok(home.inProgressProjects.some((item) => item.id === created.projectId && item.recordCount === 0 && item.lastRecordDate === null));
  await assert.rejects(createProject({ name: "역할 없음", roles: [] }, options), { status: 400 });
  await assert.rejects(createProject({ name: "   ", roles: ["PM"] }, options), { status: 400 });
});

test("Mock은 완료된 발표 주차에 맞는 문자열 enum을 반환하고 카드가 없어도 스티커를 유지한다", async () => {
  const { options, update } = await setup();
  for (const [weeks, expected] of [[[], []], [[13], ["IDEATHON"]], [[27], ["HACKATHON"]], [[13, 27], ["IDEATHON", "HACKATHON"]]]) {
    update((state) => { state.completedWeeks = weeks; state.cards = {}; });
    const home = await getProjectHome(options);
    assert.deepEqual(home.stickers.projectStickers, expected);
    assert.equal(home.stickers.totalCount, weeks.length);
    assert.deepEqual(home.recentCards, []);
    const displayed = homeStickers(home).filter((item) => ["earned", "milestone"].includes(item.kind));
    assert.equal(displayed.length, weeks.length);
    assert.deepEqual(displayed.map((item) => item.week), weeks);
  }
});

test("최근 10개에서 오래된 프로젝트 주차가 모두 빠져도 Mock·화면에서 두 스티커를 유지한다", async () => {
  const { options, update } = await setup();
  update((state) => { state.completedWeeks = [13, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37]; });
  const home = await getProjectHome(options);
  assert.equal(home.stickers.recentWeekNumbers.length, 10);
  assert.ok(!home.stickers.recentWeekNumbers.includes(13));
  assert.ok(!home.stickers.recentWeekNumbers.includes(27));
  assert.deepEqual(home.stickers.projectStickers, ["IDEATHON", "HACKATHON"]);
  const result = homeStickers(home);
  assert.equal(result.filter((item) => item.kind === "milestone").length, 2);
  assert.deepEqual(result.filter((item) => item.kind === "earned").map((item) => item.week), [30, 31, 32, 33, 34, 35, 36, 37]);
  assert.equal(result.filter((item) => ["earned", "milestone"].includes(item.kind)).length, 10);
  assert.equal(home.stickers.totalCount, 12);
});
