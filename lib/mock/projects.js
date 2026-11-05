// 시안(12~14 프로젝트, 01 홈)의 표시 값이다. API 명세가 정해지면 실제 응답으로 교체한다.
// status: "active"(진행 중) | "done"(완료)
export const MOCK_PROJECTS = [
  {
    id: "central-hackathon",
    name: "중앙해커톤",
    status: "active",
    recordCount: 2,
    lastRecordedAt: "11/1",
    cardCount: 0,
    shape: "sunFine",
    color: "yellow",
  },
  {
    id: "ideathon",
    name: "아이디어톤",
    status: "done",
    recordCount: 3,
    lastRecordedAt: "5/26",
    cardCount: 2,
    shape: "sunFine",
    color: "muted",
  },
];
