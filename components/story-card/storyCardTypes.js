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

// 초안 검토와 카드 수정에서 같은 입력 예시를 쓴다. 실제 저장 값에는 포함하지 않는다.
export const STORY_CARD_PLACEHOLDERS = {
  title: "예) 팀원과 의견을 조율해 첫 화면을 개선한 경험",
  situation: "예) 팀원마다 원하는 첫 화면이 달라 시안을 고르기 어려웠어요",
  action: "예) 시안 2개를 만들어 사용자 3명에게 보여 줬어요",
  reason: "예) 실제 사용자의 의견을 듣고 시안을 고르고 싶었어요",
  result: "예) 사용자 3명 모두 두 번째 시안을 골랐어요",
  learned: "예) 의견이 다를 때 사용자 반응을 근거로 결정하는 방법을 배웠어요",
};

export const DOCUMENT_PLACEHOLDERS = {
  session: "예) 이번 세션에서 배운 내용을 실습에 적용했어요. 막힌 부분은 공식 문서를 읽고 해결했어요",
  assignment: "예) 과제를 하며 막힌 부분을 정리했어요. 코드리뷰를 반영해 수정하고 다시 확인했어요",
  project: "예) 첫 화면 시안 2개를 공유했어요. 사용자 의견을 듣고 두 번째 시안으로 결정했어요",
};

export const SUMMARY_FIELDS = [
  { key: "situation", label: "상황" },
  { key: "action", label: "행동" },
  { key: "reason", label: "이유" },
  { key: "result", label: "결과" },
  { key: "learned", label: "배운 점" },
];
