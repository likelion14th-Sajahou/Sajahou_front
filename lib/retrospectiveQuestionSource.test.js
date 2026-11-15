import assert from "node:assert/strict";
import test from "node:test";
import { retrospectiveQuestionSource } from "./retrospectiveQuestionSource.js";

test("첨부 ID로 파일명을 찾아 원문과 함께 반환한다", () => {
  const question = { quote: "로딩, 비어 있음, 오류", sourceAttachmentId: 7 };
  assert.deepEqual(retrospectiveQuestionSource(question, [
    { attachmentId: 2, name: "다른자료.pdf" }, { attachmentId: 7, name: "세션자료.pdf" },
  ]), { label: "세션자료.pdf", quote: question.quote });
});

test("첨부 ID가 null인 근거는 내 기록으로 표시한다", () => {
  assert.deepEqual(retrospectiveQuestionSource({ quote: "우리 팀의 기록 추가 화면", sourceAttachmentId: null }), {
    label: "내 기록", quote: "우리 팀의 기록 추가 화면",
  });
});

test("근거 문장이 없으면 출처를 표시하지 않는다", () => {
  assert.equal(retrospectiveQuestionSource({ quote: null, sourceAttachmentId: 7 }), null);
});

test("파일명을 찾지 못한 첨부를 직접 입력한 기록으로 오인하지 않는다", () => {
  assert.deepEqual(retrospectiveQuestionSource({ quote: "원문", sourceAttachmentId: 99 }), { label: "첨부 자료", quote: "원문" });
});
