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

// 03 시안의 입력 예시다. 실제 파일이나 서버에 저장된 자료가 아니다.
export const MOCK_MATERIALS = {
  codeReview: "",
  sessionFiles: [
    { id: "session-pdf", name: "35주차_역기획_리디자인.pdf", kind: "pdf" },
  ],
  practice: "잠재고객 인터뷰 실습. 친구 3명한테 장보기 앱 쓰는 이유 물어봄.\n다들 쿠폰 찾기 어렵다고 함.",
  practiceFiles: [
    { id: "practice-notion", name: "실습_인터뷰_메모.zip", kind: "notion" },
  ],
  assignment: "장바구니 화면 리디자인 과제.\n시안 2개 만들었는데 2번으로 감.",
  assignmentFiles: [
    { id: "assignment-notion", name: "과제_장바구니_리디자인.zip", kind: "notion" },
    { id: "assignment-image", name: "리디자인_시안2.png", kind: "image" },
  ],
};

// 03-c 시안에 제공된 프론트엔드 예시다.
const MOCK_FRONTEND_MATERIALS = {
  sessionFiles: [{ id: "frontend-session", name: "35주차_React_상태관리.pdf", kind: "pdf" }],
  practice: "타이머 실습. 시간이 두 배씩 빨라짐 → cleanup 안 해서 그런 듯",
  practiceFiles: [],
  assignment: "투두리스트 과제. 필터 바꾸면 fetch 무한 호출.\nconst options = { filter, sort: 'date' };\nuseEffect(() => { fetchTodos(options); }, [options]);\nuseMemo로 해결함. 공식 문서도 찾아봄.",
  assignmentFiles: [
    { id: "frontend-assignment", name: "과제_투두리스트.zip", kind: "notion" },
    { id: "frontend-error", name: "콘솔_에러.png", kind: "image" },
  ],
  codeReview: "TodoItem 컴포넌트가 너무 커요. 체크박스와 수정 영역을 나눠 보면 좋겠어요.\nfilter 상태를 App에서 관리하면 Header에서도 쓸 수 있어요.\nmap 안에서 key로 index를 쓰면 삭제할 때 꼬일 수 있어요.",
};

export const MOCK_MATERIALS_BY_PART = {
  "기획·디자인": MOCK_MATERIALS,
  "프론트엔드": MOCK_FRONTEND_MATERIALS,
  // 백엔드 예시는 제공되지 않아 빈 폼으로 표시한다.
  "백엔드": { sessionFiles: [], practice: "", practiceFiles: [], assignment: "", assignmentFiles: [], codeReview: "" },
};
