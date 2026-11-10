import { FOOTPRINT_SECTIONS, FOOTPRINT_WEEKS } from "./mock/myRecord.js";

// 일정·스티커는 기존 디자인을 재사용하고 사용자 상태·카드 연결은 API에서만 읽는다.
export const footprintSections = FOOTPRINT_SECTIONS;
const STATES = { COMPLETED: "done", THIS_WEEK: "current", UPCOMING: "upcoming", NO_RECORD: "none" };
export function footprintView(data) {
  return {
    currentWeek: data.currentWeekNumber,
    weeks: data.weeks.map((item) => {
      const decoration = FOOTPRINT_WEEKS.find((week) => week.week === item.weekNumber);
      return { week: item.weekNumber, status: STATES[item.status] ?? "none",
        title: item.status === "UPCOMING" ? null : item.sessionTitle,
        shape: item.status === "UPCOMING" ? (item.isPresentationWeek ? "dashedSun" : "dashedCircle") : (item.isPresentationWeek ? "sun" : decoration?.shape ?? "circle"),
        color: item.isPresentationWeek ? "yellow" : decoration?.color ?? "blue",
        cardIds: item.cardIds.map(String), cardCount: item.cardIds.length, isCurrent: item.isCurrent };
    }),
  };
}
