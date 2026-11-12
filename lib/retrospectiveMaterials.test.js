import assert from "node:assert/strict";
import test from "node:test";
import { hasRetrospectiveMaterials } from "./retrospectiveMaterials.js";

const empty = () => ({
  hasPractice: true, practice: "", assignment: "", codeReview: "", memo: "",
  sessionFiles: [], practiceFiles: [], assignmentFiles: [],
});

test("빈 값·공백만으로는 질문을 요청하지 않고, 선택 버튼 자체도 자료로 세지 않는다", () => {
  for (const assignmentStatus of ["record", "later", "none"]) {
    assert.equal(hasRetrospectiveMaterials(empty(), { assignmentStatus }), false);
    assert.equal(hasRetrospectiveMaterials({ ...empty(), hasPractice: false }, { assignmentStatus }), false);
  }
  assert.equal(hasRetrospectiveMaterials({ ...empty(), practice: " \n", assignment: "\t", codeReview: " ", memo: " " }, { isFrontend: true }), false);
});

test("활성화된 텍스트 한 칸 또는 첨부 하나만 있어도 진행한다", () => {
  for (const field of ["practice", "assignment", "memo"]) {
    assert.equal(hasRetrospectiveMaterials({ ...empty(), [field]: "한 줄" }), true, field);
  }
  for (const field of ["sessionFiles", "practiceFiles", "assignmentFiles"]) {
    assert.equal(hasRetrospectiveMaterials({ ...empty(), [field]: [{ attachmentId: 1 }] }), true, field);
  }
  assert.equal(hasRetrospectiveMaterials({ ...empty(), codeReview: "리뷰" }, { isFrontend: true }), true);
  assert.equal(hasRetrospectiveMaterials({ ...empty(), codeReview: "리뷰" }), false);
});

test("실습 없음·과제 나중에·없음으로 숨긴 자료는 제외하되 입력값과 첨부는 유지한다", () => {
  const materials = { ...empty(), hasPractice: false, practice: "숨긴 실습", practiceFiles: [{ attachmentId: 1 }],
    assignment: "숨긴 과제", assignmentFiles: [{ attachmentId: 2 }], codeReview: "숨긴 리뷰" };
  const original = structuredClone(materials);
  for (const assignmentStatus of ["later", "none"]) {
    assert.equal(hasRetrospectiveMaterials(materials, { assignmentStatus, isFrontend: true }), false);
    assert.equal(hasRetrospectiveMaterials({ ...materials, memo: "현재 메모" }, { assignmentStatus }), true);
  }
  assert.equal(hasRetrospectiveMaterials(materials, { assignmentStatus: "record" }), true);
  assert.equal(hasRetrospectiveMaterials({ ...materials, hasPractice: true }, { assignmentStatus: "none" }), true);
  assert.deepEqual(materials, original);
});

test("별도 과제 회고에서는 과제·첨부·FE 코드리뷰만 검사한다", () => {
  const options = { isAssignment: true, isFrontend: true, assignmentStatus: "later" };
  assert.equal(hasRetrospectiveMaterials({ ...empty(), memo: "이전 메모", practice: "이전 실습", sessionFiles: [{ attachmentId: 1 }] }, options), false);
  for (const field of ["assignment", "codeReview"]) {
    assert.equal(hasRetrospectiveMaterials({ ...empty(), [field]: "과제 기록" }, options), true);
  }
  assert.equal(hasRetrospectiveMaterials({ ...empty(), assignmentFiles: [{ attachmentId: 2 }] }, options), true);
});

test("읽기 실패·링크만 저장 첨부는 빈 입력과 구분한다", () => {
  for (const extractStatus of ["PENDING", "DONE", "FAILED", "SKIPPED"]) {
    assert.equal(hasRetrospectiveMaterials({ ...empty(), assignmentFiles: [{ attachmentId: 1, extractStatus }] }), true);
  }
});
