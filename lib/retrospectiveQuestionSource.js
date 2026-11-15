// API 17: 첨부 ID가 없으면 직접 입력한 기록, 있으면 해당 첨부의 이름을 표시한다.
export function retrospectiveQuestionSource(question, attachments = []) {
  if (!question.quote) return null;
  if (question.sourceAttachmentId == null) return { label: "내 기록", quote: question.quote };
  const attachment = attachments.find((item) => String(item.attachmentId) === String(question.sourceAttachmentId));
  return { label: attachment?.name || attachment?.url || "첨부 자료", quote: question.quote };
}
