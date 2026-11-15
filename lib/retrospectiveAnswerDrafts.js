import { getAuthMode } from "./authConfig.js";

// 미제출 답변은 서버의 ANSWERED 상태와 분리해 이 브라우저에만 보관한다.
export function answerDraftKey(userId, retrospectiveId) {
  if (userId == null || retrospectiveId == null) throw new Error("저장할 사용자와 회고를 확인하지 못했어요.");
  return `sajarok_answer_drafts_v1:${getAuthMode()}:${userId}:${retrospectiveId}`;
}

const baseline = (question) => JSON.stringify([question.content, question.status, question.answer ?? null]);

export function readAnswerDrafts(storage, key, questions) {
  const raw = storage.getItem(key);
  if (!raw) return {};
  let entries;
  try {
    entries = JSON.parse(raw);
  } catch {
    throw new Error("임시 저장한 답변을 읽지 못했어요.");
  }
  if (!entries || typeof entries !== "object" || Array.isArray(entries)) throw new Error("임시 저장한 답변을 읽지 못했어요.");
  return Object.fromEntries(questions.flatMap((question) => {
    const entry = entries[question.questionId];
    // 재생성된 질문이나 서버에서 바뀐 답변에 오래된 초안을 덮어씌우지 않는다.
    return entry?.baseline === baseline(question) && typeof entry.answer === "string"
      ? [[question.questionId, entry.answer]] : [];
  }));
}

export function writeAnswerDrafts(storage, key, questions, drafts) {
  const entries = Object.fromEntries(questions.flatMap((question) => (
    Object.hasOwn(drafts, question.questionId)
      ? [[question.questionId, { baseline: baseline(question), answer: drafts[question.questionId] }]] : []
  )));
  if (Object.keys(entries).length) storage.setItem(key, JSON.stringify(entries));
  else storage.removeItem(key);
}
