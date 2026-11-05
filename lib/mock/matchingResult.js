// API 계약이 아닌 화면 검증용 예시다. 파일·링크를 분석하거나 AI를 호출하지 않는다.
const RECORDS = [
  { id: "team", title: "아이디어톤 팀빌딩 세션 회고", when: "9주차 회고", icon: "team", tags: ["사용자 리서치", "협업"], text: "팀원 4명과 각자 관심 주제를 3개씩 내고 역할을 나눴습니다. 역할을 일찍 정하니 첫 회의가 훨씬 빨리 진행된다는 것을 배웠습니다." },
  { id: "interview", title: "인터뷰 질문을 다시 짜서 진짜 불편을 찾은 경험", when: "4주차 실습 메모", icon: "interview", tags: ["사용자 리서치", "문제 정의"], text: "사용자의 실제 행동을 묻는 방향으로 인터뷰 질문을 다시 짜서 진짜 불편을 찾았습니다." },
  { id: "problem", title: "아이디어톤 · 문제 정의 세션 회고", when: "10주차 회고", icon: "problem", tags: ["문제 정의", "갈등 조율", "근거 기반 설계"], text: "팀 아이디어 6개에 문제 크기·구현 가능성·차별점을 기준으로 점수를 매겨 하나로 좁혔습니다. 기준을 먼저 합의하면 의견 충돌이 줄어든다는 것을 배웠습니다." },
  { id: "research", title: "아이디어톤 · 사용자 인터뷰 세션 회고", when: "11주차 회고", icon: "research", tags: ["사용자 리서치", "협업", "갈등 조율"], text: "사용자 인터뷰에서 관찰한 내용을 팀원과 공유하고, 서로 다른 의견을 근거와 함께 비교했습니다." },
  { id: "layout", title: "오토 레이아웃으로 시안 수정 시간을 줄인 경험", when: "5주차 과제 캡처", icon: "layout", tags: ["자기주도 학습", "UI 디자인", "UX 설계"], text: "피그마 오토 레이아웃을 튜토리얼로 따로 익혀 과제의 컴포넌트 전체에 적용했습니다. 같은 수정을 반복하는 시간을 줄여 시안을 더 여러 개 비교하고 싶었습니다." },
  { id: "retrospective", title: "아이디어톤 기디 회고 세션 회고", when: "14주차 회고", icon: "retrospective", tags: ["자기주도 학습", "UI 디자인"], text: "필요한 도구를 스스로 찾아 익히고 시안에 적용한 과정을 회고했습니다." },
];

const COMPETENCIES = [
  { name: "사용자 리서치", keywords: ["사용자", "인터뷰", "VOC", "리서치"] },
  { name: "문제 정의", keywords: ["문제", "불편", "가설"] },
  { name: "UX 설계", keywords: ["화면 흐름", "프로토타입", "UX"] },
  { name: "UI 디자인", keywords: ["피그마", "디자인", "UI"] },
  { name: "근거 기반 설계", keywords: ["데이터", "지표", "근거"] },
  { name: "자기주도 학습", keywords: ["새로운 도구", "스스로", "학습", "익혀"] },
  { name: "협업", keywords: ["협업", "팀원", "팀워크"] },
  { name: "갈등 조율", keywords: ["의견", "조율", "갈등"] },
];

const EXAMPLES = [
  {
    keywords: ["사용자", "문제", "인터뷰"], recordIds: ["team", "interview"],
    parts: [
      { text: "저는 사용자의 말보다 실제 행동에서 답을 찾으려 합니다. 멋쟁이사자처럼 '아이디어톤 팀빌딩' 세션에서 팀원마다 잘하는 것과 원하는 역할을 먼저 나누는 이유에 대해 배웠습니다. 그래서 팀원 4명과 각자 관심 주제를 3개씩 내고 역할을 나눴습니다." },
      { text: "[왜 그렇게 했는지 · 사자록에 없어요]", gap: true },
      { text: "[결과 · 숫자나 받은 반응을 채워 주세요]", gap: true },
      { text: "앞서 4주차에서도 같은 방식으로 인터뷰 질문을 다시 짜서 진짜 불편을 찾았습니다.", source: 2 },
      { text: "이 경험으로 역할을 일찍 정하니 첫 회의가 훨씬 빨리 진행된다는 것을 배웠습니다.", source: 1 },
    ],
  },
  {
    keywords: ["의견", "조율", "갈등", "협업", "팀원"], recordIds: ["problem", "research"],
    parts: [
      { text: "저는 의견이 갈릴 때 누가 맞는지보다 무엇으로 판단할지를 먼저 정합니다. 멋쟁이사자처럼 '아이디어톤 · 문제 정의' 세션에서 아이디어 평가 기준: 문제 크기·구현 가능성·차별점에 대해 배웠습니다. 그래서 팀 아이디어 6개에 평가 기준으로 점수를 매겨 하나로 좁혔습니다." },
      { text: "[왜 그렇게 했는지 · 사자록에 없어요]", gap: true },
      { text: "[결과 · 숫자나 받은 반응을 채워 주세요]", gap: true },
      { text: "이 경험으로 기준을 먼저 합의하면 의견 충돌이 줄어든다는 것을 배웠습니다.", source: 1 },
    ],
  },
  {
    keywords: ["도구", "지식", "스스로", "학습", "익혀"], recordIds: ["layout", "retrospective"],
    parts: [
      { text: "저는 필요한 도구가 있으면 스스로 찾아 익혀 바로 적용합니다. 멋쟁이사자처럼 과제 시안을 고칠 때마다 버튼과 카드 간격을 하나씩 손으로 맞추느라 시간이 오래 걸렸습니다. 그래서 세션에서 짧게 소개된 피그마 오토 레이아웃을 튜토리얼로 따로 익혀, 과제의 컴포넌트 전체에 적용했습니다. 같은 수정을 반복하는 시간을 줄여야 시안을 더 여러 개 비교해 볼 수 있다고 생각했습니다." },
      { text: "[결과 · 숫자나 받은 반응을 채워 주세요]", gap: true },
      { text: "이 경험으로 필요한 도구는 스스로 찾아 익히면 된다는 자신감이 생겼습니다.", source: 1 },
    ],
  },
];

export function draftText(parts) {
  return parts.map(({ text }) => text).join(" ");
}

export function createMockMatchingResult(fields, questions) {
  const lines = [fields.jd, fields.preferences, fields.companyInfo].join("\n").split("\n").map((line) => line.replace(/^[-\s]+/, "")).filter(Boolean);
  const competencies = COMPETENCIES.flatMap((competency) => {
    const quote = lines.find((line) => competency.keywords.some((keyword) => line.toLowerCase().includes(keyword.toLowerCase())));
    return quote ? [{ name: competency.name, quote, records: RECORDS.filter((record) => record.tags.includes(competency.name)) }] : [];
  });
  const answers = questions.filter(({ text }) => text.trim()).map((question) => {
    const example = EXAMPLES.find(({ keywords }) => keywords.some((keyword) => question.text.includes(keyword)));
    const records = example ? example.recordIds.map((id) => RECORDS.find((record) => record.id === id)) : [];
    const parts = example ? example.parts.map((part) => ({ ...part })) : [];
    if (example) {
      parts.push({ text: `${fields.company.trim() || "지원 회사"}에서 ${fields.role.trim() || "지원 직무"} 업무를 맡게 된다면, 이 경험에서 배운 것을 업무에 적용하겠습니다.`, source: 3 });
    }
    return { id: question.id, question: question.text.trim(), parts, records, editedText: null };
  });
  return { company: fields.company.trim() || "지원 공고", competencies, answers };
}
