import { MOCK_WEEK } from "./week.js";

// 커리큘럼 구간. phase는 GET /footprints가 주마다 주는 값이고(백엔드 표, 11/15), id는 주소(?section=)에 쓴다.
// 실제 화면의 구간 범위는 응답의 phase로 만든다(myRecordViewModel). 여기 주차 범위는 Mock 응답과 홈 시안에 쓴다.
// 프로젝트 구간의 마지막 주가 발표 주다(아이디어톤 12 · 해커톤 27 · 중커톤 38).
export const FOOTPRINT_SECTIONS = [
  { id: "regular-1", phase: "REGULAR_1", label: "정기 세션 1", startWeek: 1, endWeek: 9 },
  { id: "ideathon", phase: "IDEATHON", label: "아이디어톤", startWeek: 10, endWeek: 12, isProject: true },
  { id: "regular-2", phase: "REGULAR_2", label: "정기 세션 2", startWeek: 13, endWeek: 20 },
  { id: "hackathon", phase: "HACKATHON", label: "해커톤", startWeek: 21, endWeek: 27, isProject: true },
  { id: "regular-3", phase: "REGULAR_3", label: "정기 세션 3", startWeek: 28, endWeek: 34 },
  { id: "central-hackathon", phase: "JUNGKATHON", label: "중커톤", startWeek: 35, endWeek: 38, isProject: true },
  { id: "closing", phase: "WRAP_UP", label: "마무리", startWeek: 39, endWeek: 39 },
];

// status: "done"(회고 완료) | "none"(기록 없음) | "current"(이번 주) | "upcoming"(예정)
export const FOOTPRINT_WEEKS = [
  { week: 1, status: "done", title: "OT · 공통", shape: "circle", color: "blue" },
  { week: 2, status: "done", title: "문제정의 / UI·UX 입문", shape: "square", color: "green" },
  { week: 3, status: "done", title: "가설수립·가설검증 / Figma 입문", shape: "triangle", color: "coral" },
  { week: 4, status: "done", title: "인터뷰 / 정렬·그리드·오토레이아웃", shape: "semicircle", color: "yellow" },
  { week: 5, status: "done", title: "기능도출·기능명세서", shape: "pentagon", color: "coral" },
  { week: 6, status: "done", title: "기획산출물 / 와이어프레임", shape: "flower", color: "blue" },
  { week: 7, status: "done", title: "노션 / 스타일가이드", shape: "circle", color: "green" },
  { week: 8, status: "none", title: "BM과 IR" },
  { week: 9, status: "done", title: "아이디어톤 팀빌딩", shape: "square", color: "yellow" },
  { week: 10, status: "done", title: "아이디어톤 · 문제 정의", shape: "triangle", color: "green" },
  { week: 11, status: "done", title: "아이디어톤 · 사용자 인터뷰", shape: "semicircle", color: "coral" },
  { week: 12, status: "done", title: "아이디어톤 · 프로토타입", shape: "pentagon", color: "yellow" },
  { week: 13, status: "done", title: "아이디어톤 발표·회고", shape: "sun", color: "yellow", isProjectRecap: true },
  { week: 14, status: "done", title: "아이디어톤 기디 회고", shape: "flower", color: "coral" },
  { week: 15, status: "done", title: "기능명세서 심화", shape: "circle", color: "blue" },
  { week: 16, status: "none", title: "컴포넌트 기초" },
  { week: 17, status: "done", title: "기획자의 커뮤니케이션", shape: "square", color: "green" },
  { week: 18, status: "done", title: "기디 데모데이", shape: "triangle", color: "coral" },
  { week: 19, status: "done", title: "PM/DE를 위한 AI 활용법", shape: "semicircle", color: "yellow" },
  { week: 20, status: "done", title: "Slack·GitHub / 프로토타이핑", shape: "pentagon", color: "coral" },
  { week: 21, status: "done", title: "해커톤 팀빌딩", shape: "flower", color: "blue" },
  { week: 22, status: "done", title: "해커톤 · 아이디어 확정", shape: "circle", color: "green" },
  { week: 23, status: "done", title: "해커톤 · 기능 명세", shape: "square", color: "yellow" },
  { week: 24, status: "done", title: "해커톤 · 디자인", shape: "triangle", color: "green" },
  { week: 25, status: "done", title: "해커톤 · 개발 협업", shape: "semicircle", color: "coral" },
  { week: 26, status: "done", title: "해커톤 · 중간 점검", shape: "pentagon", color: "yellow" },
  { week: 27, status: "done", title: "해커톤 발표·회고", shape: "sun", color: "yellow", isProjectRecap: true },
  { week: 28, status: "none", title: "선배와의 만남" },
  { week: 29, status: "done", title: "역기획&리디자인 1", shape: "flower", color: "coral" },
  { week: 30, status: "done", title: "역기획&리디자인 2", shape: "circle", color: "blue" },
  { week: 31, status: "done", title: "기획자의 문서화", shape: "square", color: "green" },
  { week: 32, status: "done", title: "기디 특별 세션", shape: "triangle", color: "coral" },
  { week: 33, status: "done", title: "포트폴리오 세션", shape: "semicircle", color: "yellow" },
  { week: 34, status: "none", title: "중간고사 휴회" },
  { week: MOCK_WEEK.week, status: "current", title: "역기획&리디자인 3" },
  { week: 36, status: "upcoming", shape: "dashedCircle" },
  { week: 37, status: "upcoming", shape: "dashedCircle" },
  { week: 38, status: "upcoming", shape: "dashedSun" },
  { week: 39, status: "upcoming", shape: "dashedCircle" },
];

export const MOCK_MY_RECORD = {
  currentWeek: MOCK_WEEK.week,
  footprintSections: FOOTPRINT_SECTIONS,
  footprintWeeks: FOOTPRINT_WEEKS,
};
