import { FOOTPRINT_SECTIONS } from "../myRecord.js";
import { projectRecords, projectSummary } from "../projectModel.js";
import { findWeekRetrospective, getCurrentWeek } from "./retrospectives.js";

// 4. 홈 화면 조회, 6. 역량 목록 조회
export function handleHome({ path, method, user, state, tags, save, demoPart }) {
  if (path === "/competencies" && method === "GET") return save(tags);
  if (path === "/home" && method === "GET") {
    const projects = Object.values(state.projects);
    // 이번 주와 세션 회고 상태는 회고 데이터에서 읽어 회고 화면과 같은 값을 보여 준다.
    const week = getCurrentWeek(demoPart ?? user.part);
    const section = FOOTPRINT_SECTIONS.find(({ startWeek, endWeek }) => week.weekNumber >= startWeek && week.weekNumber <= endWeek);
    const session = findWeekRetrospective(state, "SESSION");
    const completedWeeks = [...new Set(state.completedWeeks)].sort((a, b) => b - a);
    const recentCards = Object.values(state.cards)
      .filter((card) => card.status === "PUBLISHED" && card.type !== "PROJECT")
      .sort((a, b) => (b.weekNumber ?? week.weekNumber) - (a.weekNumber ?? week.weekNumber) || String(b.cardId).localeCompare(String(a.cardId), "en", { numeric: true }))
      .slice(0, 3)
      .map(({ cardId, type, weekNumber, title }) => ({ cardId, type, weekNumber, title }));
    return save({ user: { name: user.name, part: user.part },
      currentWeek: { ...week, phase: section.id.replaceAll("-", "_").toUpperCase() },
      sessionRetrospective: { id: session?.id ?? null, state: session?.state ?? "NOT_STARTED" },
      // 프로젝트 스티커의 항목 구조·지급 계약은 미확정이다. 임의의 필드를 만들지 않는다.
      stickers: { totalCount: completedWeeks.length, recentWeekNumbers: completedWeeks.slice(0, 10), projectStickers: [], showThisWeekSlot: !["COMPLETED", "RESTED"].includes(session?.state) },
      inProgressProjects: projects.filter((p) => p.status === "IN_PROGRESS").map((p) => { const s = projectSummary(state, p); return { id: s.projectId, name: s.name, recordCount: s.recordCount, lastRecordDate: s.lastRecordDate }; }),
      doneProjects: projects.filter((p) => p.status === "DONE").map((p) => ({ id: p.projectId, name: p.name, cardCount: projectRecords(state, p.projectId).length, recordCount: projectRecords(state, p.projectId).length })), recentCards });
  }
  return undefined;
}
