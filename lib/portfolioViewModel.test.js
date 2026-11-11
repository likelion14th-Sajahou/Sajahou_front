import assert from "node:assert/strict";
import test from "node:test";
import { PORTFOLIO_FIELD_LABELS, restoreFinishQuestions } from "./portfolioViewModel.js";

const empty = () => ({ questions: [], inputs: {}, attachments: {}, index: 0 });

test("마치기 재진입에서 서버 답변·null·상태를 복원하고 다른 질문의 입력을 버린다", () => {
  const questions = [
    { questionId: 1, answer: "기존 답", status: "ANSWERED", quote: "질문 이유" },
    { questionId: 2, answer: null, status: "PENDING" },
    { questionId: 3, answer: null, status: "SKIPPED" },
  ];
  const restored = restoreFinishQuestions(questions, empty());
  assert.deepEqual(restored.inputs, { 1: "기존 답", 2: "", 3: "" });
  assert.equal(restored.questions[0].quote, "질문 이유");
  const current = { ...restored, index: 1, inputs: { 1: "기존 답", 2: "미저장 답", 3: "", 99: "다른 질문" }, attachments: { 2: ["미저장 첨부"], 99: ["다른 첨부"] } };
  const again = restoreFinishQuestions(questions, current);
  assert.equal(again.inputs[2], "미저장 답");
  assert.deepEqual(again.attachments, { 2: ["미저장 첨부"] });
  assert.equal(again.index, 1);
  assert.equal(again.inputs[99], undefined);
  const changed = restoreFinishQuestions([{ ...questions[1], status: "ANSWERED", answer: "서버에서 수정한 답" }], current);
  assert.deepEqual(changed.inputs, { 2: "서버에서 수정한 답" });
  assert.deepEqual(changed.attachments, {});
});

test("질문이 사라지거나 빈 배열이면 이전 입력·첨부·질문 위치를 남기지 않는다", () => {
  const current = { questions: [{ questionId: 5 }], inputs: { 5: "이전 답" }, attachments: { 5: ["이전 첨부"] }, index: 4 };
  assert.deepEqual(restoreFinishQuestions([], current), empty());
  assert.deepEqual(restoreFinishQuestions([{ questionId: 9, answer: null, status: "PENDING" }], current).inputs, { 9: "" });
});

test("포트폴리오 blanks 여섯 항목은 명세의 표시 이름을 사용한다", () => {
  assert.deepEqual(PORTFOLIO_FIELD_LABELS, { role: "내 역할", contribution: "주요 기여", problem: "문제와 해결", result: "결과", artifact: "산출물", learned: "배운 점" });
});
