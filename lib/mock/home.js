import { FOOTPRINT_SECTIONS, FOOTPRINT_WEEKS } from "./myRecord";
import { MOCK_PROJECTS } from "./projects";
import { MOCK_WEEK } from "./week";

const HOME_WEEK_STATUS = {
  idle: "default",
  writing: "draft",
  done: "done",
  paused: "rest",
};

// 회고를 완료한 주마다 스티커 1개다. 프로젝트 회고 주는 숫자 대신 프로젝트 이름을 표시한다.
const EARNED_STICKERS = FOOTPRINT_WEEKS.filter(({ status }) => status === "done").map(
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

// 시안(01 홈)의 표시 값이다. 홈 API 명세가 정해지면 실제 응답으로 교체한다.
// weekStatus: "default"(기본) | "draft"(작성 중, 01-b) | "done"(완료) | "rest"(휴회, 01-a)
export const MOCK_HOME = {
  week: MOCK_WEEK.week,
  weekStatus: HOME_WEEK_STATUS[MOCK_WEEK.status],
  stickerCount: EARNED_STICKERS.length,
  earnedStickers: EARNED_STICKERS,
  placeholderStickers: [
    { week: MOCK_WEEK.week, kind: "current", label: String(MOCK_WEEK.week) },
    { kind: "upcoming", title: "중커톤", label: "중커톤" },
  ],
  projects: MOCK_PROJECTS,
  recentRetrospectives: [
    { id: "card-33", title: "포트폴리오 세션", type: "세션 회고", shape: "semicircle", color: "yellow" },
    { id: "card-32", title: "기디 특별 세션", type: "세션 회고", shape: "triangle", color: "coral" },
    { id: "card-31", title: "기획자의 문서화", type: "세션 회고", shape: "square", color: "green" },
  ],
};
