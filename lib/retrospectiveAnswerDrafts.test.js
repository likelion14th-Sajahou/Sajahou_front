import test from "node:test";
import assert from "node:assert/strict";
import { answerDraftKey, readAnswerDrafts, writeAnswerDrafts } from "./retrospectiveAnswerDrafts.js";

function storage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

const questions = [
  { questionId: 1, content: "배운 점은?", status: "PENDING", answer: null },
  { questionId: 2, content: "이유는?", status: "ANSWERED", answer: "기존 답변" },
];

test("여러 질문의 미제출 답변과 빈 수정값을 복원하고 서버 진행 상태는 변경하지 않는다", () => {
  const local = storage();
  const original = structuredClone(questions);
  const key = answerDraftKey(10, 20);
  writeAnswerDrafts(local, key, questions, { 1: "  입력 중\n답변  ", 2: "" });
  assert.deepEqual(readAnswerDrafts(local, key, questions), { 1: "  입력 중\n답변  ", 2: "" });
  assert.deepEqual(questions, original);
  assert.deepEqual(readAnswerDrafts(local, answerDraftKey(11, 20), questions), {});
  assert.deepEqual(readAnswerDrafts(local, answerDraftKey(10, 21), questions), {});
});

test("재생성된 질문·다른 기기에서 수정된 답변·제출된 답변에는 초안을 복원하지 않는다", () => {
  const local = storage();
  const key = answerDraftKey(10, 20);
  writeAnswerDrafts(local, key, questions, { 1: "임시 답변", 2: "수정 중" });
  for (const changes of [{ questionId: 3 }, { content: "새 질문" }, { status: "ANSWERED", answer: "제출한 답" }]) {
    assert.deepEqual(readAnswerDrafts(local, key, [{ ...questions[0], ...changes }]), {});
  }
  assert.deepEqual(readAnswerDrafts(local, key, [{ ...questions[1], answer: "다른 기기의 답" }]), {});
});

test("제출한 초안만 제거하고 나머지 초안은 유지하며 모두 지우면 저장 항목을 제거한다", () => {
  const local = storage();
  const key = answerDraftKey(10, 20);
  writeAnswerDrafts(local, key, questions, { 1: "첫 답", 2: "둘째 답" });
  writeAnswerDrafts(local, key, questions, { 2: "둘째 답" });
  assert.deepEqual(readAnswerDrafts(local, key, questions), { 2: "둘째 답" });
  writeAnswerDrafts(local, key, questions, {});
  assert.equal(local.getItem(key), null);
});

test("손상된 데이터 및 저장 공간 오류를 성공으로 처리하지 않는다", () => {
  const local = storage();
  const key = answerDraftKey(10, 20);
  local.setItem(key, "broken");
  assert.throws(() => readAnswerDrafts(local, key, questions));
  assert.throws(() => writeAnswerDrafts({ setItem() { throw new Error("QuotaExceededError"); } }, key, questions, { 1: "답" }));
  assert.throws(() => answerDraftKey(null, 20));
});
