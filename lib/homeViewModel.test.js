import assert from "node:assert/strict";
import test from "node:test";
import { homeRecentCards, homeCardHref, homeStickers, homeStickerHref } from "./homeViewModel.js";
import { readRecordLocation } from "./myRecordNavigation.js";

test("서버가 선정한 최근 주차는 그대로 두고 화면에서는 오름차순으로 배치한다", () => {
  const weeks = [33, 31, 29, 27, 26, 25, 23, 22, 21, 20];
  const result = homeStickers({ currentWeek: { weekNumber: 35 }, stickers: { recentWeekNumbers: weeks, showThisWeekSlot: true, projectStickers: [] } });
  assert.deepEqual(result.filter((item) => item.kind === "earned").map((item) => item.week), [22, 23, 25, 26, 27, 29, 31, 33]);
  assert.equal(result.length, 10);
  assert.deepEqual(weeks, [33, 31, 29, 27, 26, 25, 23, 22, 21, 20]);
  assert.equal(result.find((item) => item.kind === "current").week, 35);
  assert.equal(result.find((item) => item.kind === "upcoming").week, 38);
});

test("이번 주 완료가 최근 주차에 추가되어도 기존 주차의 상대 순서는 유지된다", () => {
  const home = { currentWeek: { weekNumber: 35 }, stickers: { recentWeekNumbers: [33, 32, 31], showThisWeekSlot: true, projectStickers: [] } };
  const before = homeStickers(home).filter((item) => item.kind === "earned").map((item) => item.week);
  const after = homeStickers({ ...home, stickers: { ...home.stickers, recentWeekNumbers: [35, 33, 32, 31], showThisWeekSlot: false } });
  assert.deepEqual(after.filter((item) => item.kind === "earned").map((item) => item.week), [...before, 35]);
  assert.equal(after.some((item) => item.kind === "current"), false);
});

test("최근 회고는 서버 순서·제목을 유지하며 프로젝트를 제외한 최대 3개다", () => {
  const cards = [
    { cardId: 1, type: "PROJECT", title: "프로젝트" },
    { cardId: 2, type: "SESSION", weekNumber: 1, title: "수정된 예전 주차 회고" },
    { cardId: 3, type: "ASSIGNMENT", weekNumber: 10, title: "과제 회고" },
    { cardId: 4, type: "SESSION", weekNumber: 9, title: "세션 회고" },
    { cardId: 5, type: "SESSION", weekNumber: 8, title: "네 번째" },
  ];
  assert.deepEqual(homeRecentCards(cards).map(({ id, title }) => ({ id, title })), cards.slice(1, 4).map(({ cardId, title }) => ({ id: String(cardId), title })));
  assert.deepEqual(homeRecentCards([]), []);
  const location = readRecordLocation(new URL(homeCardHref(301), "https://test.local").searchParams);
  assert.equal(location.tab, "cards");
  assert.equal(location.card, "301");
});

test("이번 주 빈 자리 표시는 API를 따르고 획득한 예정 주차 자리는 중복 표시하지 않는다", () => {
  const result = homeStickers({ currentWeek: { weekNumber: 38 }, stickers: { recentWeekNumbers: [38], showThisWeekSlot: false, projectStickers: [] } });
  assert.equal(result.length, 1);
  assert.equal(result[0].kind, "earned");
});

test("완료 스티커는 발자취 주차 선택으로, 빈 자리는 회고로 이동하고 예정 자리는 이동하지 않는다", () => {
  const href = homeStickerHref({ kind: "earned", week: 9 });
  const location = readRecordLocation(new URL(href, "https://test.local").searchParams);
  assert.equal(location.tab, "footprints");
  assert.equal(location.week, 9);
  assert.equal(homeStickerHref({ kind: "current", week: 10 }), "/retrospective");
  assert.equal(homeStickerHref({ kind: "upcoming", week: 13 }), null);
});

test("프로젝트를 우선 포함하고 이번 주·예정 자리까지 총 10개를 고른다", () => {
  const home = { currentWeek: { weekNumber: 35 }, stickers: {
    recentWeekNumbers: [33, 32, 31, 30, 29, 27, 26, 25, 24, 23],
    projectStickers: ["HACKATHON", "IDEATHON"], showThisWeekSlot: true,
  } };
  const result = homeStickers(home);
  const projects = result.filter((item) => item.kind === "milestone");
  assert.deepEqual(projects.map((item) => [item.code, item.week, item.label]), [["IDEATHON", 13, "아이디어톤"], ["HACKATHON", 27, "해커톤"]]);
  assert.equal(result.filter((item) => item.week === 27).length, 1);
  assert.deepEqual(result.filter((item) => item.kind === "earned").map((item) => item.week), [26, 29, 30, 31, 32, 33]);
  const acquired = result.filter((item) => ["earned", "milestone"].includes(item.kind));
  assert.equal(acquired.length, 8);
  assert.deepEqual(acquired.map((item) => item.week), [13, 26, 27, 29, 30, 31, 32, 33]);
  assert.deepEqual(result.map((item) => item.week), [13, 26, 27, 29, 30, 31, 32, 33, 35, 38]);
  for (const project of projects) {
    const location = readRecordLocation(new URL(homeStickerHref(project), "https://test.local").searchParams);
    assert.equal(location.tab, "footprints");
    assert.equal(location.week, project.week);
  }
  assert.equal(result.at(-1).kind, "upcoming");
  assert.equal(result.at(-1).label, "중커톤");
});

test("프로젝트 enum이 비어 있으면 완료 주차만으로 획득 여부를 추측하지 않는다", () => {
  const home = { currentWeek: { weekNumber: 35 }, stickers: {
    totalCount: 2, recentWeekNumbers: [27, 13], projectStickers: [], showThisWeekSlot: false,
  } };
  const result = homeStickers(home);
  assert.deepEqual(result.filter((item) => item.kind === "earned").map((item) => item.week), [13, 27]);
  assert.equal(result.some((item) => item.kind === "milestone"), false);
});

test("중복·미지원 enum은 중복 표시나 임의 지급 없이 처리하고 원본·총개수는 변경하지 않는다", () => {
  const home = { currentWeek: { weekNumber: 35 }, stickers: {
    totalCount: 30, recentWeekNumbers: [33, 32],
    projectStickers: ["FUTURE_PROJECT", "IDEATHON", "IDEATHON", "__proto__"], showThisWeekSlot: true,
  } };
  const original = structuredClone(home);
  const result = homeStickers(home);
  assert.deepEqual(result.filter((item) => item.kind === "milestone").map((item) => item.code), ["IDEATHON"]);
  assert.deepEqual(home, original);
});

test("프로젝트 획득 주차의 예정 자리는 중복 생성하지 않는다", () => {
  const result = homeStickers({ currentWeek: { weekNumber: 13 }, stickers: {
    recentWeekNumbers: [13], projectStickers: ["IDEATHON"], showThisWeekSlot: false,
  } });
  assert.equal(result.length, 1);
  assert.equal(result[0].kind, "milestone");
  assert.equal(result[0].week, 13);
});
