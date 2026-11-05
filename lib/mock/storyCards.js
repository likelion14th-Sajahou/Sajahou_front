// 시안(08 스토리 카드)의 표시 값이다. API 명세가 정해지면 실제 응답으로 교체한다.
// 최신 주차가 앞에 오도록 정렬되어 있다. type: "session" | "assignment" | "project"
export const MOCK_STORY_CARDS = [
  { id: "card-33", week: 33, type: "session", whenLabel: "33주차", shape: "semicircle", color: "yellow", title: "포트폴리오 세션 세션 회고", tags: ["근거 기반 설계"], evidence: "33주차 세션 회고" },
  { id: "card-32", week: 32, type: "session", whenLabel: "32주차", shape: "triangle", color: "coral", title: "기디 특별 세션 세션 회고", tags: ["피드백 수용"], evidence: "32주차 세션 회고" },
  { id: "card-31", week: 31, type: "session", whenLabel: "31주차", shape: "square", color: "green", title: "기획자의 문서화 세션 회고", tags: ["기능 기획", "근거 기반 설계", "문서화·발표"], evidence: "31주차 세션 회고" },
  { id: "card-30", week: 30, type: "session", whenLabel: "30주차", shape: "circle", color: "yellow", title: "기능이 생긴 이유를 거꾸로 추론해 본 경험", tags: ["기능 기획", "문제 정의"], evidence: "30주차 세션 자료 · 질문 답변 2개" },
  { id: "card-29", week: 29, type: "assignment", whenLabel: "29주차 과제", shape: "triangle", color: "coral", title: "앱 리뷰 200개로 리디자인 근거를 세운 경험", tags: ["사용자 리서치", "근거 기반 설계"], evidence: "29주차 과제 메모 · 질문 답변 3개" },
  { id: "card-27", week: 27, type: "project", whenLabel: "해커톤", shape: "sunFine", color: "yellow", title: "해커톤 발표·회고 회고", tags: ["문서화·발표", "문제 해결"], evidence: "27주차 프로젝트 회고" },
  { id: "card-26", week: 26, type: "session", whenLabel: "26주차", shape: "pentagon", color: "yellow", title: "해커톤 · 중간 점검 세션 회고", tags: ["피드백 수용"], evidence: "26주차 세션 회고" },
  { id: "card-25", week: 25, type: "session", whenLabel: "25주차", shape: "semicircle", color: "coral", title: "해커톤 · 개발 협업 세션 회고", tags: ["기능 기획", "UI 디자인", "일정 관리"], evidence: "25주차 세션 회고" },
  { id: "card-24", week: 24, type: "session", whenLabel: "24주차", shape: "triangle", color: "green", title: "해커톤 · 디자인 세션 회고", tags: ["UI 디자인", "주도성"], evidence: "24주차 세션 회고" },
  { id: "card-23", week: 23, type: "session", whenLabel: "23주차", shape: "square", color: "yellow", title: "해커톤 · 기능 명세 세션 회고", tags: ["기능 기획", "협업"], evidence: "23주차 세션 회고" },
  { id: "card-22", week: 22, type: "session", whenLabel: "22주차", shape: "circle", color: "green", title: "해커톤 · 아이디어 확정 세션 회고", tags: ["기능 기획"], evidence: "22주차 세션 회고" },
  { id: "card-21", week: 21, type: "session", whenLabel: "21주차", shape: "circle", color: "blue", title: "해커톤 팀빌딩 세션 회고", tags: ["협업", "주도성", "일정 관리"], evidence: "21주차 세션 회고" },
  { id: "card-20", week: 20, type: "session", whenLabel: "20주차", shape: "pentagon", color: "coral", title: "Slack·GitHub / 프로토타이핑 세션 회고", tags: ["UI 디자인", "협업"], evidence: "20주차 세션 회고" },
  { id: "card-19", week: 19, type: "session", whenLabel: "19주차", shape: "semicircle", color: "yellow", title: "PM/DE를 위한 AI 활용법 세션 회고", tags: ["사용자 리서치", "UX 설계"], evidence: "19주차 세션 회고" },
  { id: "card-18", week: 18, type: "session", whenLabel: "18주차", shape: "triangle", color: "coral", title: "기디 데모데이 세션 회고", tags: ["문서화·발표", "문제 해결", "갈등 조율"], evidence: "18주차 세션 회고" },
  { id: "card-17", week: 17, type: "session", whenLabel: "17주차", shape: "square", color: "green", title: "기획자의 커뮤니케이션 세션 회고", tags: ["피드백 수용"], evidence: "17주차 세션 회고" },
  { id: "card-15", week: 15, type: "assignment", whenLabel: "15주차 과제", shape: "square", color: "blue", title: "경쟁 앱 5개를 비교해 정보 구조를 다시 짠 경험", tags: ["UX 설계", "근거 기반 설계"], evidence: "15주차 과제 노션 페이지 · 질문 답변 3개" },
  { id: "card-14", week: 14, type: "session", whenLabel: "14주차", shape: "circle", color: "coral", title: "아이디어톤 기디 회고 세션 회고", tags: ["자기주도 학습"], evidence: "14주차 세션 회고" },
  { id: "card-13-a", week: 13, type: "project", whenLabel: "아이디어톤 · 5월", shape: "sunFine", color: "yellow", title: "평가 기준을 먼저 정해 팀 의견을 30분 만에 모은 경험", tags: ["갈등 조율", "의사결정"], evidence: "프로젝트 기록 5개 · 회의 메모" },
  { id: "card-13-b", week: 13, type: "project", whenLabel: "아이디어톤 · 5월", shape: "pentagon", color: "coral", title: "발표 피드백을 받아 첫 화면을 다시 설계한 경험", tags: ["피드백 수용", "UX 설계"], evidence: "프로젝트 기록 2개 · 심사 코멘트" },
  { id: "card-12", week: 12, type: "session", whenLabel: "12주차", shape: "pentagon", color: "yellow", title: "아이디어톤 · 프로토타입 세션 회고", tags: ["UI 디자인"], evidence: "12주차 세션 회고" },
  { id: "card-11", week: 11, type: "session", whenLabel: "11주차", shape: "semicircle", color: "coral", title: "아이디어톤 · 사용자 인터뷰 세션 회고", tags: ["사용자 리서치", "갈등 조율"], evidence: "11주차 세션 회고" },
  { id: "card-10", week: 10, type: "session", whenLabel: "10주차", shape: "triangle", color: "green", title: "아이디어톤 · 문제 정의 세션 회고", tags: ["문제 정의", "의사결정", "갈등 조율"], evidence: "10주차 세션 회고" },
  { id: "card-9", week: 9, type: "session", whenLabel: "9주차", shape: "square", color: "yellow", title: "아이디어톤 팀빌딩 세션 회고", tags: ["사용자 리서치", "문제 정의", "UI 디자인"], evidence: "9주차 세션 회고" },
  { id: "card-7", week: 7, type: "session", whenLabel: "7주차", shape: "circle", color: "green", title: "노션 / 스타일가이드 세션 회고", tags: ["UI 디자인", "문서화·발표", "주도성"], evidence: "7주차 세션 회고" },
  { id: "card-6", week: 6, type: "session", whenLabel: "6주차", shape: "circle", color: "blue", title: "기획산출물 / 와이어프레임 세션 회고", tags: ["UX 설계", "문서화·발표", "주도성"], evidence: "6주차 세션 회고" },
  { id: "card-5", week: 5, type: "assignment", whenLabel: "5주차 과제", shape: "square", color: "green", title: "오토 레이아웃으로 시안 수정 시간을 줄인 경험", tags: ["UI 디자인", "자기주도 학습"], evidence: "5주차 과제 캡처 · 질문 답변 2개" },
  { id: "card-4", week: 4, type: "session", whenLabel: "4주차", shape: "circle", color: "blue", title: "인터뷰 질문을 다시 짜서 진짜 불편을 찾은 경험", tags: ["문제 정의", "사용자 리서치"], evidence: "4주차 실습 메모 · 질문 답변 2개" },
  { id: "card-3", week: 3, type: "session", whenLabel: "3주차", shape: "triangle", color: "coral", title: "가설수립·가설검증 / Figma 입문 세션 회고", tags: ["문제 정의", "UI 디자인"], evidence: "3주차 세션 회고" },
  { id: "card-2", week: 2, type: "session", whenLabel: "2주차", shape: "square", color: "green", title: "문제정의 / UI·UX 입문 세션 회고", tags: ["문제 정의", "UX 설계", "UI 디자인"], evidence: "2주차 세션 회고" },
  { id: "card-1", week: 1, type: "session", whenLabel: "1주차", shape: "circle", color: "blue", title: "OT · 공통 세션 세션 회고", tags: ["일정 관리"], evidence: "1주차 세션 회고" },
];

// 시안(09)에 내용이 있는 카드는 29주차뿐이다. 나머지 카드는 아래 기본값으로 표시한다.
// document는 노션에 붙여 넣는 Markdown 원문이다. 화면 표시와 복사가 이 값 하나를 함께 쓴다.
const CARD_DETAILS = {
  "card-29": {
    document: `## 29주차 과제 회고 · 역기획&리디자인 1

### 세션 내용 정리 · 세션 자료 요약
#### 역기획이란
- 이미 있는 서비스를 보고 '왜 이렇게 만들었을까'를 거꾸로 추론하는 것
- 기획 → 화면 순서를 뒤집어 화면 → 기획 의도를 찾음
#### 역기획 순서
1. 기능 하나를 고른다 (예: 장바구니의 쿠폰 적용)
2. 이 기능이 없을 때 사용자가 겪었을 불편을 추론한다
3. 회사가 얻는 것(매출, 재방문)을 추론한다
4. 리뷰·VOC로 추론이 맞는지 확인한다
#### 리디자인 범위 정하기
- 리뷰·VOC를 불편 유형별로 분류하고, 가장 많이 나온 불편부터 범위로 잡음
- 바꾸는 곳마다 근거(리뷰 수, 인터뷰 말)를 함께 남김

### 과제
- 한 일: 앱스토어 리뷰 200개를 모아 불편 유형별로 분류했고, 가장 많이 나온 '쿠폰 적용 위치를 못 찾겠다'는 불편을 리디자인 범위로 정했습니다.
- 이유: 시안을 설명할 때 '제 생각에는'이 아니라 리뷰 수로 말하고 싶었기 때문입니다.
- 결과: 쿠폰 영역을 결제 버튼 위로 옮긴 시안을 근거 표와 함께 제출했고, 코드리뷰에서 '근거가 분명하다'는 피드백을 받았습니다.

### 느낀 점
- 디자인 결정마다 근거를 남기는 습관이 생겼습니다.`,
    summary: {
      situation: "장바구니 화면 리디자인 과제에서 어디를 바꿔야 할지 감으로만 정하고 있었습니다.",
      action: "앱스토어 리뷰 200개를 모아 불편 유형별로 분류했고, 가장 많이 나온 '쿠폰 적용 위치를 못 찾겠다'는 불편을 리디자인 범위로 정했습니다.",
      reason: "시안을 설명할 때 '제 생각에는'이 아니라 리뷰 수로 말하고 싶었기 때문입니다.",
      result: "쿠폰 영역을 결제 버튼 위로 옮긴 시안을 근거 표와 함께 제출했고, 코드리뷰에서 '근거가 분명하다'는 피드백을 받았습니다.",
      learned: "디자인 결정마다 근거를 남기는 습관이 생겼습니다.",
    },
  },
};

function getDefaultDetail({ whenLabel, title }) {
  return {
    document: `## ${whenLabel} · ${title}

### 임시 내용
- 이 카드의 회고록 전문은 아직 목업에 없어요.`,
    summary: {
      situation: "",
      action: "",
      reason: "",
      result: "",
      learned: "이 카드의 배운 점은 아직 목업에 없어요.",
    },
  };
}

export function getStoryCardDetail(card) {
  return CARD_DETAILS[card.id] ?? getDefaultDetail(card);
}
