import { MOCK_WEEK } from "./week";

// 회고 화면의 표시 값이다. API 명세가 정해지면 실제 응답으로 교체한다.
// status: "idle"(시작 전) | "writing"(작성 중) | "paused"(휴회)
// dueLabel은 시안의 표시 문자열이며, API 날짜 형식을 정의하는 값이 아니다.
export const MOCK_RETROSPECTIVE = {
  week: MOCK_WEEK.week,
  status: MOCK_WEEK.status,
  deadlines: [
    { id: "session", label: "세션 회고", dueLabel: "11/1(일) 23:59" },
    { id: "assignment", label: "과제 회고", dueLabel: "11/3(화) 23:59" },
  ],
};
