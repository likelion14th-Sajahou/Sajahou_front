import assert from "node:assert/strict";
import test from "node:test";
import { homeRecentCards, homeCardHref, homeStickers, homeStickerHref } from "./homeViewModel.js";
import { readRecordLocation } from "./myRecordNavigation.js";

test("서버가 선정한 최근 주차는 그대로 두고 화면에서는 오름차순으로 배치한다", () => {
  const weeks = [33, 31, 29, 27, 26, 25, 23, 22, 21, 20];
  const result = homeStickers({ currentWeek: { weekNumber: 35 }, stickers: { recentWeekNumbers: weeks, showThisWeekSlot: true, projectStickers: [] } });
  assert.deepEqual(result.filter((item) => item.kind === "earned").map((item) => item.week), [20, 21, 22, 23, 25, 26, 27, 29, 31, 33]);
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

test("프로젝트는 최근 10개 밖이어도 모두 표시하고 같은 주차의 일반 스티커는 대체한다", () => {
  const home = { currentWeek: { weekNumber: 35 }, stickers: {
    recentWeekNumbers: [33, 32, 31, 30, 29, 27, 26, 25, 24, 23],
    projectStickers: ["HACKATHON", "IDEATHON"], showThisWeekSlot: true,
  } };
  const result = homeStickers(home);
  const projects = result.filter((item) => item.kind === "milestone");
  assert.deepEqual(projects.map((item) => [item.code, item.week, item.label]), [["IDEATHON", 13, "아이디어톤"], ["HACKATHON", 27, "해커톤"]]);
  assert.equal(result.filter((item) => item.week === 27).length, 1);
  assert.equal(result.filter((item) => item.kind === "earned").length, 9);
  assert.equal(result.filter((item) => ["earned", "milestone"].includes(item.kind)).length, 11);
  for (const project of projects) {
    const location = readRecordLocation(new URL(homeStickerHref(project), "https://test.local").searchParams);
    assert.equal(location.tab, "footprints");
    assert.equal(location.week, project.week);
  }
  assert.equal(result.at(-1).kind, "upcoming");
  assert.equal(result.at(-1).label, "중커톤");
});
