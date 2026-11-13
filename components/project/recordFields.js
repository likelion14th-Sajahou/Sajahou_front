// label은 기록 목록, formLabel은 입력 폼, placeholder는 기록 추가 폼에 쓴다(문구는 11/13 프로토타입).
export const RECORD_FIELDS = [
  { key: "did", label: "한 일", formLabel: "이번에 한 일", placeholder: "예) 메인 화면 시안 2개를 만들어 공유했어요" },
  { key: "problem", label: "고민·해결", formLabel: "고민하거나 해결한 문제", placeholder: "예) 팀원마다 원하는 첫 화면이 달랐어요" },
  { key: "choice", label: "선택과 이유", formLabel: "선택한 방법과 이유", placeholder: "예) 사용자 3명에게 보여 주고 고르기로 했어요" },
  { key: "result", label: "결과·반응", formLabel: "결과나 받은 반응", placeholder: "예) 3명 모두 두 번째 시안을 골랐어요" },
  { key: "next", label: "다음", formLabel: "다음에 할 일", placeholder: "예) 기록 추가 화면 시안 만들기" },
];

// 5칸과 첨부가 모두 비어 있는 기록을 저장하려 할 때의 안내다(H-14). 기록 추가와 수정이 함께 쓴다.
export const EMPTY_RECORD_MESSAGE = "5칸 중 한 칸 이상 적거나 자료를 첨부해 주세요.";

// 프로젝트 기록 첨부의 자료 종류(API category)와 화면 이름이다. 고르는 칩과 첨부 칩의 이름표가 함께 쓴다.
export const ATTACHMENT_CATEGORIES = [["MEETING_NOTE", "회의록"], ["PRESENTATION", "발표 자료"], ["DESIGN", "디자인"], ["OUTPUT", "산출물"], ["OTHER", "기타"]];

export function attachmentCategoryName(category) {
  return ATTACHMENT_CATEGORIES.find(([value]) => value === category)?.[1];
}
