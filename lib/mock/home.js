import { FOOTPRINT_SECTIONS } from "./myRecord";
import { MOCK_WEEK } from "./week";

// 시안(01 홈)의 표시 값과 계산이다. 홈 API 명세가 정해지면 실제 응답으로 교체한다.
// 홈 상태: "default"(기본) | "draft"(작성 중, 01-b) | "done"(완료) | "rest"(휴회, 01-a)
export const HOME_WEEK_STATUS = {
  idle: "default",
  writing: "draft",
  done: "done",
  paused: "rest",
};

const RECENT_RETROSPECTIVE_COUNT = 3;

// 회고를 완료한 주마다 스티커 1개다. 프로젝트 회고 주는 숫자 대신 프로젝트 이름을 표시한다.
export function getEarnedStickers(footprintWeeks) {
  return footprintWeeks.filter(({ status }) => status === "done").map(
    ({ week, title, shape, color, isProjectRecap }) => ({
      week,
      kind: isProjectRecap ? "milestone" : "earned",
      title,
      label: isProjectRecap
        ? FOOTPRINT_SECTIONS.find(({ startWeek, endWeek }) => week >= startWeek && week <= endWeek).label
        : String(week),
      shape,
      color,
    }),
  );
}

export const HOME_PLACEHOLDER_STICKERS = [
  { week: MOCK_WEEK.week, kind: "current", label: String(MOCK_WEEK.week) },
  { kind: "upcoming", title: "중커톤", label: "중커톤" },
];

// 프로젝트 대표 카드를 뺀 최근 회고다. 카드 제목의 "세션 회고"는 유형 표시와 겹쳐 뺀다.
export function getRecentRetrospectives(storyCards) {
  return storyCards
    .filter(({ type }) => type !== "project")
    .toSorted((a, b) => b.week - a.week)
    .slice(0, RECENT_RETROSPECTIVE_COUNT)
    .map((card) => ({ ...card, title: card.title.replace(/ 세션 회고$/, "") }));
}
