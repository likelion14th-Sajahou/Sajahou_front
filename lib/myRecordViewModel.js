import { FOOTPRINT_SECTIONS, FOOTPRINT_WEEKS } from "./mock/myRecord.js";

// 구간 이름과 디자인만 재사용하고, 실제 구간 범위는 API의 phase로 구성한다.
// 표에 없는 phase가 오면 구간을 버리지 않고 코드를 그대로 이름으로 보여 준다.
const SECTION_META = Object.fromEntries(FOOTPRINT_SECTIONS.map(({ id, phase, label, isProject = false }) => [phase, { id, label, isProject }]));
const unknownSection = (phase) => ({ id: phase.toLowerCase().replaceAll("_", "-"), label: phase, isProject: false });

function sectionsFromWeeks(weeks) {
  const sections = new Map();
  for (const { phase, weekNumber } of weeks) {
    if (!phase) continue;
    const meta = SECTION_META[phase] ?? unknownSection(phase);
    const section = sections.get(phase);
    if (section) {
      section.startWeek = Math.min(section.startWeek, weekNumber);
      section.endWeek = Math.max(section.endWeek, weekNumber);
    } else {
      sections.set(phase, { ...meta, phase, startWeek: weekNumber, endWeek: weekNumber });
    }
  }
  return [...sections.values()].sort((a, b) => a.startWeek - b.startWeek);
}
const STATES = { COMPLETED: "done", THIS_WEEK: "current", UPCOMING: "upcoming", NO_RECORD: "none" };
export function footprintView(data) {
  return {
    currentWeek: data.currentWeekNumber,
    sections: sectionsFromWeeks(data.weeks),
    weeks: data.weeks.map((item) => {
      const decoration = FOOTPRINT_WEEKS.find((week) => week.week === item.weekNumber);
      return { week: item.weekNumber, phase: item.phase, status: STATES[item.status] ?? "none",
        title: item.status === "UPCOMING" ? null : item.sessionTitle,
        shape: item.status === "UPCOMING" ? (item.isPresentationWeek ? "dashedSun" : "dashedCircle") : (item.isPresentationWeek ? "sun" : decoration?.shape ?? "circle"),
        color: item.isPresentationWeek ? "yellow" : decoration?.color ?? "blue",
        cardIds: item.cardIds.map(String), cardCount: item.cardIds.length, isCurrent: item.isCurrent,
        // 그 주에 붙은 프로젝트 스티커(종류 코드). 회고 상태(status)와 따로 본다.
        stickers: item.stickers ?? [] };
    }),
  };
}
