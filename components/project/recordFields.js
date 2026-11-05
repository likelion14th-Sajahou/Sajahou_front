// label은 기록 목록, formLabel은 입력 폼, placeholder는 기록 추가 폼에 쓴다.
export const RECORD_FIELDS = [
  { key: "did", label: "한 일", formLabel: "이번에 한 일", placeholder: "예) 메인 화면 시안 공유" },
  { key: "problem", label: "고민·해결", formLabel: "고민하거나 해결한 문제", placeholder: "예) 팀원마다 원하는 첫 화면이 달랐음" },
  { key: "choice", label: "선택과 이유", formLabel: "선택한 방법과 이유", placeholder: "예) 사용자 인터뷰 결과로 정하기로 함" },
  { key: "result", label: "결과·반응", formLabel: "결과나 받은 반응", placeholder: "예) 멘토가 흐름이 명확해졌다고 함" },
  { key: "next", label: "다음", formLabel: "다음에 할 일", placeholder: "예) 프로토타입 연결" },
];
