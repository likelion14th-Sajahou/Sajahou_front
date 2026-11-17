import { MOCK_WEEK } from "./week.js";

// 커리큘럼 구간은 실제 화면과 함께 쓰므로 lib/curriculum.js에 둔다. 목업 코드는 여기서 같이 가져다 쓴다.
export { FOOTPRINT_SECTIONS } from "../curriculum.js";

// 목업 데모 계정의 주차별 회고 상태와 세션 제목이다(GET /footprints 목업 응답). 스티커 모양은 화면이 lib/curriculum.js로 정한다.
// status: "done"(회고 완료) | "none"(기록 없음) | "current"(이번 주) | "upcoming"(예정)
export const FOOTPRINT_WEEKS = [
  { week: 1, status: "done", title: "OT · 공통" },
  { week: 2, status: "done", title: "문제정의 / UI·UX 입문" },
  { week: 3, status: "done", title: "가설수립·가설검증 / Figma 입문" },
  { week: 4, status: "done", title: "인터뷰 / 정렬·그리드·오토레이아웃" },
  { week: 5, status: "done", title: "기능도출·기능명세서" },
  { week: 6, status: "done", title: "기획산출물 / 와이어프레임" },
  { week: 7, status: "done", title: "노션 / 스타일가이드" },
  { week: 8, status: "none", title: "BM과 IR" },
  { week: 9, status: "done", title: "아이디어톤 팀빌딩" },
  { week: 10, status: "done", title: "아이디어톤 · 문제 정의" },
  { week: 11, status: "done", title: "아이디어톤 · 사용자 인터뷰" },
  // 아이디어톤 발표 주는 12주차다(백엔드 표, 11/15). 13주차는 정기 세션 2의 첫 주다.
  { week: 12, status: "done", title: "아이디어톤 발표·회고" },
  { week: 13, status: "done", title: "아이디어톤 피드백 반영" },
  { week: 14, status: "done", title: "아이디어톤 기디 회고" },
  { week: 15, status: "done", title: "기능명세서 심화" },
  { week: 16, status: "none", title: "컴포넌트 기초" },
  { week: 17, status: "done", title: "기획자의 커뮤니케이션" },
  { week: 18, status: "done", title: "기디 데모데이" },
  { week: 19, status: "done", title: "PM/DE를 위한 AI 활용법" },
  { week: 20, status: "done", title: "Slack·GitHub / 프로토타이핑" },
  { week: 21, status: "done", title: "해커톤 팀빌딩" },
  { week: 22, status: "done", title: "해커톤 · 아이디어 확정" },
  { week: 23, status: "done", title: "해커톤 · 기능 명세" },
  { week: 24, status: "done", title: "해커톤 · 디자인" },
  { week: 25, status: "done", title: "해커톤 · 개발 협업" },
  { week: 26, status: "done", title: "해커톤 · 중간 점검" },
  { week: 27, status: "done", title: "해커톤 발표·회고" },
  { week: 28, status: "none", title: "선배와의 만남" },
  { week: 29, status: "done", title: "역기획&리디자인 1" },
  { week: 30, status: "done", title: "역기획&리디자인 2" },
  { week: 31, status: "done", title: "기획자의 문서화" },
  { week: 32, status: "done", title: "기디 특별 세션" },
  { week: 33, status: "done", title: "포트폴리오 세션" },
  { week: 34, status: "none", title: "중간고사 휴회" },
  { week: MOCK_WEEK.week, status: "current", title: "역기획&리디자인 3" },
  { week: 36, status: "upcoming" },
  { week: 37, status: "upcoming" },
  { week: 38, status: "upcoming" },
  { week: 39, status: "upcoming" },
];
