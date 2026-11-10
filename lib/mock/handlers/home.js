import { projectRecords, projectSummary } from "../projectModel.js";

// 4. 홈 화면 조회, 6. 역량 목록 조회
export function handleHome({ path, method, user, state, tags, save }) {
  if (path === "/competencies" && method === "GET") return save(tags);
  if (path === "/home" && method === "GET") {
    const projects = Object.values(state.projects);
    return save({ user: { name: user.name, part: user.part },
      currentWeek: { weekId: 10, weekNumber: 10, phase: "IDEATHON", sessionTitle: "아이디어톤 준비", sessionDeadline: "2026-11-08T23:59:00+09:00", assignmentDeadline: "2026-11-10T23:59:00+09:00" },
      sessionRetrospective: { id: null, state: "NOT_STARTED" },
      stickers: { totalCount: 0, recentWeekNumbers: [], projectStickers: [], showThisWeekSlot: true },
      inProgressProjects: projects.filter((p) => p.status === "IN_PROGRESS").map((p) => { const s = projectSummary(state, p); return { id: s.projectId, name: s.name, recordCount: s.recordCount, lastRecordDate: s.lastRecordDate }; }),
      doneProjects: projects.filter((p) => p.status === "DONE").map((p) => ({ id: p.projectId, name: p.name, cardCount: projectRecords(state, p.projectId).length, recordCount: projectRecords(state, p.projectId).length })), recentCards: [] });
  }
  return undefined;
}
