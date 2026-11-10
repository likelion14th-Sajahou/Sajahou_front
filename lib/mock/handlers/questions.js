import { invalid, notFound } from "../mockResponse.js";
import { text } from "../projectModel.js";

// 18. 질문 답하기·건너뛰기. 기록·마치기 질문을 처리한다. 어느 질문이든 다시 보내면 답을 덮어쓴다.
export function handleQuestions({ split, id, method, body, state, save, resolveAttachments, pending, pendingError }) {
  if (split[0] !== "questions" || split.length !== 2 || method !== "PATCH") return undefined;
  const question = state.questions[id];
  if (!question) return notFound();
  // 마치기의 '산출물 요청' 질문만 답 대신 첨부를 받는다.
  const artifact = question.field === "artifact";
  if (!["ANSWERED", "SKIPPED"].includes(body.status)) return invalid({ status: "상태를 선택해 주세요." });
  if (body.status === "ANSWERED" && !(artifact ? body.attachmentIds?.length : text(body.answer))) return invalid({ answer: "답변이나 산출물을 입력해 주세요." });
  if (body.attachmentIds !== undefined && (!artifact || !resolveAttachments(body.attachmentIds))) return invalid({ attachmentIds: "산출물 질문의 첨부를 확인해 주세요." });
  if (artifact && pending(body.attachmentIds ?? [])) return pendingError();
  question.status = body.status; question.answer = body.status === "SKIPPED" ? null : text(body.answer);
  if (artifact) {
    question.attachmentIds = body.status === "SKIPPED" ? [] : body.attachmentIds;
    for (const aid of question.attachmentIds) state.attachments[aid].projectId = question.projectId;
  }
  return save({ questionId: id, seq: question.seq, status: question.status, answer: question.answer });
}
