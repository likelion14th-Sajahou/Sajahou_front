import { MOCK_WEEK } from "./week";

const HOME_WEEK_STATUS = {
  idle: "default",
  writing: "draft",
  done: "done",
  paused: "rest",
};

// 시안(01 홈)의 표시 값이다. 홈 API 명세가 정해지면 실제 응답으로 교체한다.
// weekStatus: "default"(기본) | "draft"(작성 중, 01-b) | "done"(완료) | "rest"(휴회, 01-a)
export const MOCK_HOME = {
  week: MOCK_WEEK.week,
  weekStatus: HOME_WEEK_STATUS[MOCK_WEEK.status],
  stickerCount: 30,
  stickers: [
    { week: 13, kind: "milestone", title: "아이디어톤 발표·회고", label: "아이디어톤", shape: "sun", color: "yellow" },
    { week: 24, kind: "earned", title: "해커톤 · 디자인", label: "24", shape: "triangle", color: "green" },
    { week: 25, kind: "earned", title: "해커톤 · 개발 협업", label: "25", shape: "semicircle", color: "coral" },
    { week: 26, kind: "earned", title: "해커톤 · 중간 점검", label: "26", shape: "pentagon", color: "yellow" },
    { week: 27, kind: "milestone", title: "해커톤 발표·회고", label: "해커톤", shape: "sun", color: "yellow" },
    { week: 29, kind: "earned", title: "역기획&리디자인 1", label: "29", shape: "flower", color: "coral" },
    { week: 30, kind: "earned", title: "역기획&리디자인 2", label: "30", shape: "circle", color: "blue" },
    { week: 31, kind: "earned", title: "기획자의 문서화", label: "31", shape: "square", color: "green" },
    { week: 32, kind: "earned", title: "기디 특별 세션", label: "32", shape: "triangle", color: "coral" },
    { week: 33, kind: "earned", title: "포트폴리오 세션", label: "33", shape: "semicircle", color: "yellow" },
    { week: MOCK_WEEK.week, kind: "current", label: String(MOCK_WEEK.week) },
    { kind: "upcoming", title: "중커톤", label: "중커톤" },
  ],
  projects: [
    { id: "central-hackathon", name: "중앙해커톤", recordCount: 2, lastRecordedAt: "11/1", shape: "sunFine", color: "yellow" },
  ],
  recentRetrospectives: [
    { id: "card-33", title: "포트폴리오 세션", type: "세션 회고", shape: "semicircle", color: "yellow" },
    { id: "card-32", title: "기디 특별 세션", type: "세션 회고", shape: "triangle", color: "coral" },
    { id: "card-31", title: "기획자의 문서화", type: "세션 회고", shape: "square", color: "green" },
  ],
};
