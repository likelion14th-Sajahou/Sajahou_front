import { MOCK_WEEK } from "./week";

// 05 검토 시안의 표시용 초안이다. 실제 AI 생성 결과나 저장된 사용자 기록이 아니다.
export const MOCK_REVIEW_DRAFT = {
  retrospective: "## 35주차 회고 · 역기획 & 리디자인 3\n\n### 세션 내용 정리 · 세션 자료 요약\n#### 역기획과 리디자인은 어떻게 다른가\n- 역기획: 이미 있는 화면을 보고 '왜 이렇게 만들었을까'를 거꾸로 추론해 기획 의도를 찾는 것 (분석)\n- 리디자인: 찾은 의도는 살리면서 사용자가 불편해하는 부분을 다시 설계하는 것 (설계)\n- 역기획 없이 리디자인하면 '예쁘게 바꾸기'에 그치고, 원래 있던 이유를 놓쳐 다른 문제가 생김\n#### 역기획 4단계\n1. 기능 하나를 고른다: 화면 전체가 아니라 '장바구니의 쿠폰 적용'처럼 작게\n2. 사용자 관점: 이 기능이 없을 때 사용자는 무엇이 번거로웠을까\n3. 회사 관점: 이 위치·모양으로 둔 이유는 무엇일까 (주문 수, 객단가, 재방문)\n4. 확인: 앱 리뷰·VOC·인터뷰로 추론이 맞는지 근거를 찾는다\n#### 리디자인 범위 정하기\n- 리뷰·VOC를 불편 유형별로 묶고, 가장 많이 나온 불편부터 범위로 잡는다\n- 의도는 지키고 문제만 고친다: 예) '메뉴 고를 때 쿠폰 노출'은 두고, 결제 직전에 한 번 더 보이게\n#### 근거 남기는 법\n- 바꾸는 곳마다 '원래 의도 → 사용자 불편(근거) → 바꾼 내용 → 기대 효과' 한 줄씩\n\n### 실습\n- 한 일: 잠재고객 인터뷰 실습. 친구 3명한테 장보기 앱 쓰는 이유 물어봄. / 다들 쿠폰 찾기 어렵다고 함.\n- 발견: “쿠폰은 결제 직전에 생각나는데 그때 찾을 데가 없다”는 말이요. 3명 다 비슷한 얘기를 했어요.\n- 인터뷰 방식: 질문을 미리 5개 정해 두고, 답이 짧으면 ‘왜요?’를 한 번 더 물었어요.\n\n### 과제\n- 문제: 장바구니 화면 리디자인 과제.\n- 선택과 이유: 1번은 쿠폰을 메뉴 위에 크게 띄웠고, 2번은 결제 버튼 바로 위에 넣었어요. 인터뷰 말처럼 결제 직전에 보이게 하려고요.\n- 세션 개념 적용: 메뉴를 고를 때 쿠폰을 보여 줘서 더 주문하게 하려는 의도 같아요. 그 의도는 살리고 결제 쪽에 한 번 더 보여 주는 걸로 정리했어요.\n\n### 느낀 점\n- 바꾸기 전에 3명이라도 먼저 물어보기. 시안을 고르는 기준이 생겨요.",
  story: {
    title: "인터뷰로 리디자인 방향을 정한 경험",
    situation: "장바구니 리디자인 과제에서 시안 2개 중 무엇을 고를지 기준이 없었음",
    action: "1번은 쿠폰을 메뉴 위에 크게 띄웠고, 2번은 결제 버튼 바로 위에 넣었어요. 인터뷰 말처럼 결제 직전에 보이게 하려고요. 메뉴를 고를 때 쿠폰을 보여 줘서 더 주문하게 하려는 의도 같아요. 그 의도는 살리고 결제 쪽에 한 번 더 보여 주는 걸로 정리했어요. 질문을 미리 5개 정해 두고, 답이 짧으면 ‘왜요?’를 한 번 더 물었어요.",
    result: "“쿠폰은 결제 직전에 생각나는데 그때 찾을 데가 없다”는 말이요. 3명 다 비슷한 얘기를 했어요.",
  },
  selectedTags: ["사용자 리서치", "근거 기반 설계", "주도성"],
  evidence: ["세션 자료 PDF", "실습 메모 · 첨부 1개", "과제 메모 · 첨부 2개", "AI 질문 답변 5개"],
};


export function getWeekCardId(isAssignment) {
  return `card-${MOCK_WEEK.week}${isAssignment ? "-assignment" : ""}`;
}

// 저장한 회고를 스토리 카드로 바꾼다. 실제로는 서버가 저장하고 돌려주는 값이다.
export function buildWeekStoryCard(draft, isAssignment) {
  const { title, situation, action, result } = draft.story;

  return {
    id: getWeekCardId(isAssignment),
    week: MOCK_WEEK.week,
    type: isAssignment ? "assignment" : "session",
    whenLabel: `${MOCK_WEEK.week}주차${isAssignment ? " 과제" : ""}`,
    shape: isAssignment ? "square" : "circle",
    color: isAssignment ? "green" : "blue",
    title,
    tags: draft.selectedTags,
    evidence: draft.evidence.join(" · "),
    document: draft.retrospective,
    summary: { situation, action, reason: "", result, learned: "" },
  };
}

// 회고 화면의 표시 값이다. API 명세가 정해지면 실제 응답으로 교체한다.
// dueLabel은 시안의 표시 문자열이며, API 날짜 형식을 정의하는 값이 아니다.
export const MOCK_RETROSPECTIVE = {
  week: MOCK_WEEK.week,
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

// 03-d 검수 전용 데이터다. 실제 변경 감지 결과나 질문·답변 데이터가 아니다.
export const MOCK_MATERIALS_CHANGED_PREVIEW = {
  answerCount: 2,
  materialsByPart: {
    ...MOCK_MATERIALS_BY_PART,
    "기획·디자인": {
      ...MOCK_MATERIALS,
      practice: `${MOCK_MATERIALS.practice}\n실습 끝나고 인터뷰 1명 더 함.`,
    },
  },
};

// 04 및 04-a 시안의 기획·디자인 예시다. 실제 AI 생성 결과나 API 응답 계약이 아니다.
export const MOCK_AI_QUESTIONS = [
  {
    id: "evidence",
    category: "근거와 숫자",
    tone: "yellow",
    source: "다들 쿠폰 찾기 어렵다고 함",
    question: "인터뷰에서 실제로 나온 말 중에 가장 기억에 남는 건 뭐였어요?",
    exampleAnswer: "“쿠폰은 결제 직전에 생각나는데 그때 찾을 데가 없다”는 말이요. 3명 다 비슷한 얘기를 했어요.",
  },
  {
    id: "missing", category: "빠진 칸", tone: "red", source: "2번으로 감",
    question: "시안 2개 중에 2번을 고른 이유는요?",
    exampleAnswer: "1번은 쿠폰을 메뉴 위에 크게 띄웠고, 2번은 결제 버튼 바로 위에 넣었어요. 인터뷰 말처럼 결제 직전에 보이게 하려고요.",
  },
  {
    id: "connection", category: "세션과 연결", tone: "blue", source: "장바구니 화면 리디자인",
    question: "이번 세션의 ‘기획 의도 거꾸로 읽기’로 보면, 원래 쿠폰이 메뉴 쪽에 있던 이유는 뭐였을까요?",
    exampleAnswer: "메뉴를 고를 때 쿠폰을 보여 줘서 더 주문하게 하려는 의도 같아요. 그 의도는 살리고 결제 쪽에 한 번 더 보여 주는 걸로 정리했어요.",
  },
  {
    id: "competency", category: "역량 신호", tone: "green", source: "친구 3명한테",
    question: "인터뷰를 하면서 스스로 정한 방식이 있었나요?",
    exampleAnswer: "질문을 미리 5개 정해 두고, 답이 짧으면 ‘왜요?’를 한 번 더 물었어요.",
  },
  {
    id: "reflection", category: "느낀 점", tone: "neutral", source: "이번 주 세션 자료",
    question: "이번 주에 다음에도 가져가고 싶은 게 하나 있다면요?",
    exampleAnswer: "바꾸기 전에 3명이라도 먼저 물어보기. 시안을 고르는 기준이 생겨요.",
  },
];
