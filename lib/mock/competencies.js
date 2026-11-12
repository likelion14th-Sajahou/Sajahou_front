// 파트별 역량 고정 목록(C-06)이다. 이름은 기능명세서, 뜻 문구는 프로토타입(2차 회의 반영본)을 따른다.
// 운영 데이터 API가 정해지면 이 값을 실제 응답으로 교체한다.
const COMMON_COMPETENCIES = [
  { name: "문제 해결", description: "막힌 문제의 원인을 찾아 풀어요" },
  { name: "자기주도 학습", description: "필요한 것을 스스로 찾아 배워요" },
  { name: "협업", description: "팀원·다른 파트와 함께 일해요" },
  { name: "갈등 조율", description: "다른 의견을 조율해 합의를 만들어요" },
  { name: "주도성", description: "먼저 나서서 맡고 끝까지 책임져요" },
  { name: "피드백 수용", description: "받은 피드백을 다음 결과에 반영해요" },
  { name: "일정 관리", description: "마감과 일정을 계획하고 지켜요" },
];

const PART_COMPETENCIES = {
  "기획·디자인": [
    { name: "사용자 리서치", description: "인터뷰·설문·VOC로 사용자를 이해해요" },
    { name: "문제 정의", description: "불편과 원인을 찾아 풀 문제를 좁혀요" },
    { name: "기능 기획", description: "문제에서 기능을 뽑고 범위·우선순위를 정해요" },
    { name: "UX 설계", description: "정보 구조와 화면 흐름을 설계해요" },
    { name: "UI 디자인", description: "화면을 보기 좋고 일관되게 디자인해요" },
    { name: "근거 기반 설계", description: "데이터·지표·리뷰로 결정을 설명해요" },
    { name: "의사결정", description: "선택지를 비교해 근거 있게 정해요" },
    { name: "문서화·발표", description: "문서·발표로 생각을 전달해요" },
  ],
  프론트엔드: [
    // 기존 저장 데이터의 ID는 유지하고 표시 순서만 명세에 맞춘다.
    { id: 23, name: "개념 이해", description: "동작 원리를 이해하고 설명해요" },
    { id: 16, name: "화면 구현", description: "디자인을 동작하는 화면으로 만들어요" },
    { id: 17, name: "상태 관리", description: "상태와 렌더링 흐름을 설계해요" },
    { id: 18, name: "API 연동", description: "서버 데이터를 받아 화면에 연결해요" },
    { id: 19, name: "성능 최적화", description: "불필요한 렌더링·로딩을 줄여요" },
    { id: 20, name: "반응형·접근성", description: "기기·사용자 누구나 쓸 수 있게 만들어요" },
    { id: 21, name: "UX 개선", description: "로딩·오류·인터랙션을 사용자 입장에서 다듬어요" },
    { id: 22, name: "코드 품질 및 유지보수", description: "리팩터링·리뷰·테스트로 코드를 다듬어요" },
  ],
  백엔드: [
    { name: "API 설계", description: "요청·응답 규칙을 설계해요" },
    { name: "데이터 모델링", description: "엔티티와 테이블 관계를 설계해요" },
    { name: "쿼리 최적화", description: "쿼리 수와 응답 시간을 줄여요" },
    { name: "인증·보안", description: "로그인·권한·데이터를 안전하게 지켜요" },
    { name: "배포·운영", description: "서버를 배포하고 안정적으로 운영해요" },
    { name: "테스트", description: "테스트로 동작을 검증해요" },
    { name: "코드 품질", description: "구조와 가독성을 다듬어요" },
    { name: "개념 이해", description: "동작 원리를 이해하고 설명해요" },
  ],
};

// 내 파트 8개 다음에 공통 7개를 붙인 15개를 항상 같은 순서로 돌려준다.
export function getCompetencies(part) {
  return [...(PART_COMPETENCIES[part] ?? []), ...COMMON_COMPETENCIES];
}

// 이름 변경 전 mock 저장 데이터도 동일한 ID로 조회·편집·매칭할 수 있게 옮긴다.
// 백엔드의 '코드 품질'(다른 ID)과 사용자가 작성한 본문은 바꾸지 않는다.
export function migrateCompetencyNames(state) {
  if (state.competencyNamesVersion === 1) return;
  const rename = (items = []) => {
    for (const item of items) {
      const id = item.id ?? item.competencyId;
      if (id === 21 && item.name === "사용자 경험 개선") item.name = "UX 개선";
      if (id === 22 && item.name === "코드 품질") item.name = "코드 품질 및 유지보수";
    }
  };
  for (const item of [...Object.values(state.cards), ...Object.values(state.records), ...Object.values(state.jobPostings ?? {})]) rename(item.competencies);
  for (const question of Object.values(state.coverLetterQuestions ?? {})) rename(question.answer?.missingCompetencies);
  state.competencyNamesVersion = 1;
}
