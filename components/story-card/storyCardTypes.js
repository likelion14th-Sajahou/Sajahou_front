// 스토리 카드 유형·본문 칸 이름처럼 카드 화면들(나의 사자록·프로젝트·홈·자소서 매칭)이 함께 쓰는 값이다.
export const STORY_CARD_TYPES = {
  session: { label: "세션 회고", tone: "blue" },
  assignment: { label: "과제 회고", tone: "green" },
  project: { label: "프로젝트", tone: "yellow" },
};

// 프로젝트 카드는 기록 1개로 만든 카드라 본문이 '기록 전문'이다(A-10, H-22). 복사 안내는 기존 문구를 쓴다.
export const RECORD_TEXT = {
  title: "기록 전문",
  copied: "기록을 복사했어요. 노션에 붙여 넣어 주세요.",
};

export const SUMMARY_FIELDS = [
  { key: "situation", label: "상황" },
  { key: "action", label: "행동" },
  { key: "reason", label: "이유" },
  { key: "result", label: "결과" },
  { key: "learned", label: "배운 점" },
];
