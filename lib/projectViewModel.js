import { FOOTPRINT_WEEKS } from "./mock/myRecord.js";

// API 응답은 그대로 유지하고, 기존 화면의 표시 이름만 이 경계에서 맞춘다.
const ROLE_NAMES = { PM: "PM", PLANNING: "기획", DESIGN: "디자인", FRONTEND: "프론트엔드", BACKEND: "백엔드" };
export const roleCodes = (roles) => roles.map((name) => Object.keys(ROLE_NAMES).find((key) => ROLE_NAMES[key] === name) ?? name);
export function attachmentView(item) {
  return { ...item, id: String(item.attachmentId), kind: item.type === "LINK" ? "link" : /\.pdf$/i.test(item.name) ? "pdf" : /\.(png|jpe?g)$/i.test(item.name) ? "image" : "file", name: item.name ?? item.url };
}
export function recordView(item) {
  return { ...item, id: String(item.recordId), cardId: String(item.cardId), weekday: new Date(`${item.date}T12:00:00+09:00`).toLocaleDateString("ko-KR", { weekday: "short", timeZone: "Asia/Seoul" }),
    problem: item.concern ?? "", choice: item.decision ?? "", next: item.nextStep ?? "", organizedByAi: item.isAiOrganized,
    tags: item.competencies.map((c) => c.name), attachments: item.attachments.map(attachmentView) };
}
export function projectView(item, status) {
  return { ...item, id: String(item.projectId), status: (status ?? item.status) === "DONE" ? "done" : "active", roles: item.roles.map((r) => ROLE_NAMES[r] ?? r),
    shape: "pentagon", color: "blue", startedAt: item.startedOn, records: item.records?.map(recordView) ?? [] };
}
export function recordBody(item, competencies, { isUpdate = false } = {}) {
  // PATCH는 빈 문자열로 삭제하고, null이나 누락된 필드는 기존 값을 유지한다.
  const emptyText = isUpdate ? "" : null;
  return { did: item.did || emptyText, concern: item.problem || emptyText, decision: item.choice || emptyText, result: item.result || emptyText, nextStep: item.next || emptyText,
    attachmentIds: item.attachments.map((a) => a.attachmentId), competencyIds: item.tags.map((name) => competencies.find((c) => c.name === name)?.id), isAiOrganized: item.organizedByAi ?? false };
}

// 같은 질문·서버 답에는 미전송 입력을 유지한다. 새 질문이나 서버에서 바뀐 답에는 이전 입력을 섞지 않는다.
export function recordQuestionState(current, questions, attachments, { regenerate = false } = {}) {
  const sameQuestions = !regenerate && current.questions.length === questions.length
    && questions.every((question, index) => question.questionId === current.questions[index].questionId);
  const inputs = {};
  if (!regenerate) {
    for (const question of questions) {
      const previous = current.questions.find((item) => item.questionId === question.questionId);
      if (previous && previous.answer === question.answer && previous.status === question.status
        && Object.hasOwn(current.inputs, question.questionId)) inputs[question.questionId] = current.inputs[question.questionId];
    }
  }
  return { questions, inputs, index: sameQuestions ? Math.min(current.index, Math.max(0, questions.length - 1)) : 0,
    sourceAttachments: sameQuestions ? current.sourceAttachments : attachments.map((item) => ({ ...item })) };
}
export function cardView(item) {
  const type = (item.type ?? "PROJECT").toLowerCase();
  const sticker = FOOTPRINT_WEEKS.find((week) => week.week === item.weekNumber && week.status === "done");
  return { ...item, id: String(item.cardId), type, week: item.weekNumber, projectId: item.projectId == null ? null : String(item.projectId),
    recordId: String(item.sourceRecord?.recordId ?? item.sourceRecords?.[0]?.recordId ?? ""),
    shape: type === "project" ? "sunFine" : type === "assignment" ? "square" : sticker?.shape ?? "circle",
    color: type === "project" ? "yellow" : type === "assignment" ? "green" : sticker?.color ?? "blue",
    whenLabel: type === "project" ? item.projectName : `${item.weekNumber}주차${type === "assignment" ? " 과제" : ""}`,
    tags: item.competencies.map((c) => c.name),
    evidence: [...item.evidenceSummary, ...(item.deletedRecordCount > 0 ? [`삭제된 기록 ${item.deletedRecordCount}개`] : [])].join(" · "),
    document: item.fullMarkdown ?? "", summary: { situation: item.situation ?? "", action: item.action ?? "", reason: item.reason ?? "", result: item.result ?? "", learned: item.learned ?? "" } };
}
