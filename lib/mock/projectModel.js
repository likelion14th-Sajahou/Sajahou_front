import { getCompetencies } from "./competencies.js";
import { AUTH_PART_LABELS } from "../authConfig.js";

export const RECORD_KEYS = ["did", "concern", "decision", "result", "nextStep"];
// 첨부 종류(API 7·8의 category). 프로젝트 기록의 '기타'는 OTHER다(백엔드 확인, 2026-11-13).
export const CATEGORIES = ["SESSION_PDF", "PRACTICE", "ASSIGNMENT", "MEETING_NOTE", "PRESENTATION", "DESIGN", "OUTPUT", "OTHER", "JOB_POSTING"];
const PARTS = ["PLAN_DESIGN", "FRONTEND", "BACKEND"];

// ID는 mock fixture 전용이다. live에서는 반드시 /competencies의 ID를 사용한다.
// cardCount는 나의 사자록에 보이는 공개 카드만 센다. 회고 검토 중인 초안(DRAFT) 카드는 태그가 있어도 빼서, 역량 필터의 수와 걸러진 카드 수가 같다.
export function competenciesFor(part, cards = []) {
  return getCompetencies(AUTH_PART_LABELS[part]).map((item, index) => {
    const id = item.id ?? (index < 8 ? 8 + PARTS.indexOf(part) * 8 + index : index - 7);
    return { ...item, id, part: index < 8 ? part : "COMMON",
      cardCount: Object.values(cards).filter((card) => card.status === "PUBLISHED" && card.competencies.some((tag) => tag.id === id)).length };
  });
}
export const emptyState = () => ({ version: 1, nextId: 1, projects: {}, records: {}, attachments: {}, questions: {}, cards: {}, finish: {} });
export const newId = (state) => state.nextId++;
export const dateOn = (time) => new Date(time + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
export const text = (value) => typeof value === "string" && value.trim() ? value.trim() : null;
export function recordDocument(record) {
  const labels = { memo: "메모", did: "한 일", concern: "고민·해결", decision: "선택과 이유", result: "결과·반응", nextStep: "다음" };
  return Object.entries(labels).map(([key, label]) => `## ${label}\n${record[key] || "(아직 기록에 없어요)"}`).join("\n\n");
}
export function syncCard(state, record, competencies) {
  record.competencies = competencies.map((item) => ({ ...item }));
  const previous = state.cards[record.cardId];
  record.cardId ??= newId(state);
  state.cards[record.cardId] = {
    cardId: record.cardId, type: "PROJECT", status: "PUBLISHED", weekNumber: null,
    projectId: record.projectId, projectName: state.projects[record.projectId].name,
    title: previous?.title ?? record.did ?? record.memo?.split("\n")[0] ?? "(한 일 비어 있음)",
    situation: record.concern, action: record.did, reason: record.decision, result: record.result,
    learned: previous?.learned ?? null, competencies,
    blanks: [!record.concern && "situation", !record.did && "action", !record.decision && "reason", !record.result && "result", !previous?.learned && "learned"].filter(Boolean),
    fullMarkdown: recordDocument(record), evidence: {},
    evidenceSummary: [`${record.date} 프로젝트 기록 · 첨부 ${record.attachmentIds.length}개`],
    // 최신 데이터베이스 22번에 남아 있는 응답 필드명을 유지한다(관계는 1:1).
    sourceRecords: [{ recordId: record.recordId, date: record.date }], deletedRecordCount: 0,
  };
}
export function publicRecord(state, record) {
  const { projectId: _projectId, createdAt: _createdAt, questionSnapshot: _questionSnapshot, attachmentIds, ...data } = record;
  return { ...data, competencies: record.competencies ?? [],
    attachments: attachmentIds.map((id) => state.attachments[id]?.data).filter(Boolean) };
}
export function projectRecords(state, id) {
  return Object.values(state.records).filter((r) => r.projectId === id && r.status === "SAVED")
    .sort((a, b) => b.createdAt - a.createdAt || b.recordId - a.recordId);
}
export function projectSummary(state, project) {
  const records = projectRecords(state, project.projectId);
  const { projectId, name, subtitle, roles } = project;
  return { projectId, name, subtitle, roles, recordCount: records.length, lastRecordDate: records[0]?.date ?? null };
}
export function removeRecord(state, id) {
  const record = state.records[id];
  if (!record) return;
  delete state.cards[record.cardId];
  delete state.records[id];
  for (const question of Object.values(state.questions)) {
    if (question.recordId === id) delete state.questions[question.questionId];
  }
  for (const attachmentId of record.attachmentIds) {
    const used = Object.values(state.records).some((r) => r.attachmentIds.includes(attachmentId)) ||
      Object.values(state.questions).some((q) => q.attachmentIds?.includes(attachmentId));
    if (!used) delete state.attachments[attachmentId];
  }
}
export function questionsFor(state, key, value) {
  return Object.values(state.questions).filter((q) => q[key] === value).sort((a, b) => a.seq - b.seq);
}
export function publicQuestion(question) {
  const { recordId: _recordId, projectId: _projectId, retrospectiveId: _retrospectiveId, field: _field, attachmentIds: _ids, ...data } = question;
  return data;
}
