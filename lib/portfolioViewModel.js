export const PORTFOLIO_FIELD_LABELS = {
  role: "내 역할", contribution: "주요 기여", problem: "문제와 해결",
  result: "결과", artifact: "산출물", learned: "배운 점",
};

// 서버 답변이 바뀌면 서버 값을 복원한다. 같은 질문의 미저장 입력만 유지한다.
export function restoreFinishQuestions(questions, current) {
  const inputs = {};
  const attachments = {};
  for (const question of questions) {
    const previous = current.questions.find((item) => item.questionId === question.questionId);
    const unchanged = previous && previous.status === question.status && previous.answer === question.answer;
    inputs[question.questionId] = unchanged ? (current.inputs[question.questionId] ?? question.answer ?? "") : question.answer ?? "";
    if (unchanged && current.attachments[question.questionId]) attachments[question.questionId] = current.attachments[question.questionId];
  }
  const previousId = current.questions[current.index]?.questionId;
  const index = Math.max(0, questions.findIndex((question) => question.questionId === previousId));
  return { questions, inputs, attachments, index };
}
