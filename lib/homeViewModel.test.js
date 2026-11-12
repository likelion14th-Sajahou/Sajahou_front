import assert from "node:assert/strict";
import test from "node:test";
import { homeRecentCards, homeCardHref, homeStickers, homeStickerHref } from "./homeViewModel.js";
import { readRecordLocation } from "./myRecordNavigation.js";

const footprints = (weeks) => ({ weeks: weeks.map((weekNumber) => ({ weekNumber, status: "COMPLETED" })) });

test("받은 프로젝트를 우선 포함하고 남은 칸은 최근 회고로 채워 총 10개를 주차순 정렬한다", () => {
  const data = footprints(Array.from({ length: 39 }, (_, index) => index + 1));
  const original = structuredClone(data);
  const result = homeStickers(data);
  assert.deepEqual(result.map((item) => item.week), [13, 27, 32, 33, 34, 35, 36, 37, 38, 39]);
  assert.deepEqual(result.filter((item) => item.kind === "milestone").map(({ week, label, image }) => ({ week, label, image })), [
    { week: 13, label: "아이디어톤", image: "/images/stickers/trophy.png" },
    { week: 27, label: "해커톤", image: "/images/stickers/laurel.png" },
    { week: 38, label: "중커톤", image: "/images/stickers/medal.png" },
  ]);
  assert.equal(new Set(result.map((item) => item.week)).size, 10);
  assert.deepEqual(data, original);
});

test("미완료·이번 주·예정 주차는 표시하지 않고 획득한 스티커만 표시한다", () => {
  const data = footprints([12, 26, 37]);
  data.weeks.push(
    { weekNumber: 13, status: "NO_RECORD" },
    { weekNumber: 27, status: "THIS_WEEK" },
    { weekNumber: 38, status: "UPCOMING" },
  );
  assert.deepEqual(homeStickers(data).map(({ week, kind }) => [week, kind]), [[12, "earned"], [26, "earned"], [37, "earned"]]);
  assert.deepEqual(homeStickers(footprints([])), []);
});

test("일반 프로젝트 진행 주는 별을 쓰고 지정 회고 주를 완료할 때만 프로젝트 스티커가 붙는다", () => {
  const result = homeStickers(footprints([10, 12, 13, 21, 26, 27, 35, 37, 38]));
  assert.deepEqual(result.filter((item) => item.kind === "milestone").map((item) => item.week), [13, 27, 38]);
  assert.ok(result.filter((item) => item.kind === "earned").every((item) => item.image.includes("/star-")));
});

test("프로젝트가 없으면 최근 완료 10주를 고르고 중복 완료 주차는 한 번만 표시한다", () => {
  const weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12];
  assert.deepEqual(homeStickers(footprints(weeks)).map((item) => item.week), [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
});

test("일반·프로젝트 스티커 모두 원래 회고 주차의 발자취로 이동한다", () => {
  for (const sticker of homeStickers(footprints([9, 13, 27, 38]))) {
    const location = readRecordLocation(new URL(homeStickerHref(sticker), "https://test.local").searchParams);
    assert.equal(location.tab, "footprints");
    assert.equal(location.week, sticker.week);
  }
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
