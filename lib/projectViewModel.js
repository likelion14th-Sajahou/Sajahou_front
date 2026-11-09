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
export function recordBody(item, competencies) {
  return { did: item.did || null, concern: item.problem || null, decision: item.choice || null, result: item.result || null, nextStep: item.next || null,
    attachmentIds: item.attachments.map((a) => a.attachmentId), competencyIds: item.tags.map((name) => competencies.find((c) => c.name === name)?.id), isAiOrganized: item.organizedByAi ?? false };
}
export function cardView(item) {
  return { ...item, id: String(item.cardId), type: "project", week: item.weekNumber ?? 0, projectId: String(item.projectId),
    recordId: String(item.sourceRecord?.recordId ?? item.sourceRecords?.[0]?.recordId ?? ""), whenLabel: item.projectName,
    shape: "sunFine", color: "yellow", tags: item.competencies.map((c) => c.name), evidence: item.evidenceSummary.join(" · "),
    document: item.fullMarkdown ?? "", summary: { situation: item.situation ?? "", action: item.action ?? "", reason: item.reason ?? "", result: item.result ?? "", learned: item.learned ?? "" } };
}
