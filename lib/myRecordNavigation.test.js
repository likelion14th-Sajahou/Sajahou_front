import assert from "node:assert/strict";
import test from "node:test";
import { readRecordLocation, recordHref, weekDestination } from "./myRecordNavigation.js";
const params = (query) => new URLSearchParams(query);
test("직접 카드·강조·기존 태그 링크는 카드 탭, 명시한 탭은 필터보다 우선한다", () => {
  for (const query of ["card=9", "highlight=card-29", "tag=협업", "competencyId=3"]) assert.equal(readRecordLocation(params(query)).tab, "cards");
  assert.equal(readRecordLocation(params("tab=footprints&tag=협업")).tab, "footprints");
  assert.equal(readRecordLocation(params("")).tab, "footprints");
});
test("주차 해제·탭 이동·팝업 닫기는 다른 조건을 보존하고 검색어를 안전하게 인코딩한다", () => {
  const original = params("tab=cards&week=9&type=assignment&competencyId=3&q=a%26b&card=1");
  const href = recordHref(original, { week: null, card: null, tab: "footprints" });
  const result = params(href.split("?")[1]);
  assert.equal(result.get("q"), "a&b"); assert.equal(result.get("type"), "assignment");
  assert.equal(result.get("competencyId"), "3"); assert.equal(result.has("week"), false); assert.equal(result.has("card"), false);
  assert.equal(recordHref(params(""), { q: "javascript:alert(1)" }).startsWith("/my-record?"), true);
});
test("잘못된 URL은 안전한 기본값으로 해석하고 파라미터 중복을 쌓지 않는다", () => {
  for (const week of ["0", "40", "-1", "1e1", "abc"]) assert.equal(readRecordLocation(params(`week=${week}`)).week, undefined);
  assert.equal(readRecordLocation(params("week=39&type=invalid&section=invalid")).week, 39);
  assert.equal(readRecordLocation(params("type=invalid")).type, "all");
  assert.equal(params(recordHref(params("q=a&q=b"), { q: "c" }).split("?")[1]).getAll("q").length, 1);
});
test("완료 0·1·여러 장, 이번 주, 예정·기록 없음의 이동을 구분한다", () => {
  const base = { week: 9, status: "done", cardIds: [] };
  assert.equal(weekDestination(base), null);
  assert.equal(weekDestination({ ...base, status: "none" }), null);
  assert.equal(weekDestination({ ...base, status: "upcoming" }), null);
  assert.equal(weekDestination({ ...base, status: "current" }), "/retrospective");
  assert.match(weekDestination({ ...base, cardIds: [301] }), /card=301/);
  const href = weekDestination({ ...base, cardIds: [301, 302] }, params("q=숨김&type=project"));
  assert.match(href, /week=9/); assert.ok(!href.includes("card=")); assert.ok(!href.includes("q=")); assert.ok(!href.includes("type="));
});
