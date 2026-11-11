import assert from "node:assert/strict";
import test from "node:test";
import { homeStickers, homeStickerHref } from "./homeViewModel.js";
import { readRecordLocation } from "./myRecordNavigation.js";

test("스티커는 서버 선정 순서를 보존하며 화면에서 추가 제한·재정렬하지 않는다", () => {
  const weeks = [33, 31, 29, 27, 26, 25, 23, 22, 21, 20];
  const result = homeStickers({ currentWeek: { weekNumber: 35 }, stickers: { recentWeekNumbers: weeks, showThisWeekSlot: true, projectStickers: [] } });
  assert.deepEqual(result.filter((item) => item.kind === "earned").map((item) => item.week), weeks);
  assert.equal(result.find((item) => item.kind === "current").week, 35);
  assert.equal(result.find((item) => item.kind === "upcoming").week, 38);
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
