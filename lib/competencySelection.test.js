import assert from "node:assert/strict";
import test from "node:test";
import { selectedCompetencyNames } from "./competencySelection.js";

const items = [{ id: 1, name: "협업" }, { id: 2, name: "UX 개선" }, { id: 3, name: "상태 관리" }];

test("왕복한 카드의 이전 이름을 ID로 복원하고 보이지 않는 역량·중복을 제외한다", () => {
  const saved = [{ id: 2, name: "사용자 경험 개선" }, { id: 99, name: "다른 파트 역량" }, { id: 2, name: "UX 개선" }];
  const restored = selectedCompetencyNames(saved, items);
  assert.deepEqual(restored, ["UX 개선"]);
  assert.deepEqual(selectedCompetencyNames([...restored, "협업", "상태 관리"], items), ["UX 개선", "협업", "상태 관리"]);
  assert.equal(saved.length, 3);
});

test("수정 화면의 이름 배열도 같은 기준으로 계산하며 삭제된 ID를 다른 역량으로 연결하지 않는다", () => {
  assert.deepEqual(selectedCompetencyNames(["협업", "협업", "없는 역량"], items), ["협업"]);
  assert.deepEqual(selectedCompetencyNames([{ id: 99, name: "협업" }], items), []);
  assert.deepEqual(selectedCompetencyNames([{ competencyId: "2", name: "이전 이름" }], items), ["UX 개선"]);
});
