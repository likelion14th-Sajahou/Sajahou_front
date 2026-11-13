import test from "node:test";
import assert from "node:assert/strict";
import { formatMonthDay } from "./formatDate.js";

test("날짜를 '월/일'로 짧게 바꾸고, 형식이 다르면 그대로 둔다", () => {
  assert.equal(formatMonthDay("2026-11-03"), "11/3");
  assert.equal(formatMonthDay("2026-05-12"), "5/12");
  assert.equal(formatMonthDay("-"), "-");
  assert.equal(formatMonthDay(undefined), undefined);
});
