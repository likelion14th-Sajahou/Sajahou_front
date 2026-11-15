import assert from "node:assert/strict";
import test from "node:test";
import { footprintView } from "./myRecordViewModel.js";

const week = (weekNumber, phase, extra = {}) => ({
  weekNumber, phase, status: "COMPLETED", sessionTitle: `${weekNumber}주차`,
  isCurrent: false, isPresentationWeek: false, cardIds: [], stickers: [], ...extra,
});

test("서버 phase로 아이디어톤 12주차와 다음 구간 13주차의 경계를 구성한다", () => {
  const data = { currentWeekNumber: 13, weeks: [
    week(13, "REGULAR_2", { stickers: ["IDEATHON"] }), week(10, "IDEATHON"), week(12, "IDEATHON"),
  ] };
  const original = structuredClone(data);
  const view = footprintView(data);
  assert.deepEqual(view.sections.map(({ id, startWeek, endWeek }) => ({ id, startWeek, endWeek })), [
    { id: "ideathon", startWeek: 10, endWeek: 12 }, { id: "regular-2", startWeek: 13, endWeek: 13 },
  ]);
  assert.equal(view.weeks.find(({ week }) => week === 13).phase, "REGULAR_2");
  assert.deepEqual(view.weeks.find(({ week }) => week === 13).stickers, ["IDEATHON"]);
  assert.deepEqual(data, original);
});

test("구간 범위를 특정 주차로 고정하지 않고 응답의 실제 주차를 사용한다", () => {
  const view = footprintView({ currentWeekNumber: 9, weeks: [week(8, "IDEATHON"), week(9, "IDEATHON")] });
  assert.equal(view.sections[0].startWeek, 8);
  assert.equal(view.sections[0].endWeek, 9);
  assert.equal(view.sections[0].label, "아이디어톤");
});

test("백엔드 phase 이름으로 중커톤·마무리 구간을 찾고, 표에 없는 phase는 코드를 이름으로 보여 준다", () => {
  const view = footprintView({ currentWeekNumber: 37, weeks: [
    week(34, "REGULAR_3"), week(35, "JUNGKATHON"), week(38, "JUNGKATHON"), week(39, "WRAP_UP"), week(40, "EXTRA_WEEK"),
  ] });
  assert.deepEqual(view.sections.map(({ id, label, startWeek, endWeek, isProject }) => [id, label, startWeek, endWeek, isProject]), [
    ["regular-3", "정기 세션 3", 34, 34, false],
    ["central-hackathon", "중커톤", 35, 38, true],
    ["closing", "마무리", 39, 39, false],
    ["extra-week", "EXTRA_WEEK", 40, 40, false],
  ]);
});

test("서버에서 받지 않은 구간은 임의로 생성하지 않는다", () => {
  const view = footprintView({ currentWeekNumber: 1, weeks: [] });
  assert.deepEqual(view.sections, []);
});
