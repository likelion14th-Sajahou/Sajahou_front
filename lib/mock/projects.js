// 시안(12~14 프로젝트, 01 홈)의 표시 값이다. API 명세가 정해지면 실제 응답으로 교체한다.
// status: "active"(진행 중) | "done"(완료)
// records: 최신 기록이 앞에 온다. 칸이 비어 있으면 화면에 표시하지 않는다.
// representativeCards: 대표 카드 순서대로, 스토리 카드 id와 근거로 쓴 기록 id를 담는다.
// 시안의 기록 폼과 새 기록에 쓰는 오늘 날짜다. API나 실제 날짜로 바꿀 때 교체한다.
export const MOCK_TODAY = { date: "11/1", weekday: "일" };
export const MOCK_TODAY_LABEL = `${MOCK_TODAY.date}(${MOCK_TODAY.weekday})`;

// 기록 추가의 "예시 자료 넣기"에 쓰는 시안 값이다.
export const MOCK_RECORD_EXAMPLE = {
  memo: "11/3 기획 회의. 홈 화면에 뭘 먼저 보여 줄지 논의. 나는 시안 2개 준비",
  attachments: [
    { id: "example-notes", kind: "notion", name: "11-03_기획회의_회의록.zip" },
    { id: "example-design", kind: "image", name: "홈_시안_v2.png" },
    { id: "example-link", kind: "link", name: "www.figma.com/design/sajarok-home" },
  ],
};

const PROJECTS = [
  {
    id: "central-hackathon",
    name: "중앙해커톤",
    subtitle: "사자록 만들기",
    status: "active",
    role: "PM",
    startedAt: "10/30",
    representativeCards: [],
    shape: "sunFine",
    color: "yellow",
    records: [
      {
        id: "central-hackathon-2",
        date: "11/1",
        weekday: "일",
        did: "프론트·백엔드 친구에게 실제 회고 방식 물어보기",
        problem: "코드리뷰가 매주 있는 줄 몰랐음",
        choice: "확정 전에 실제 사용자에게 다시 확인하기",
        next: "IR 문제정의 수정",
        attachments: [
          { id: "sajarok-flow", kind: "link", name: "www.figma.com/design/sajarok-flow" },
        ],
      },
      {
        id: "central-hackathon-1",
        date: "10/30",
        weekday: "금",
        did: "팀 아이디어 확정, 18일 개발 일정 짜기",
        problem: "하고 싶은 기능이 너무 많아 범위가 안 잡힘",
        choice: "P0·P1·P2로 나누고 P2는 과감히 제외",
        result: "팀원 모두 첫 주 할 일이 명확해짐",
        next: "AI 질문 프롬프트 초안",
        attachments: [{ id: "kickoff-notes", kind: "notion", name: "10-30_킥오프_회의록.zip" }],
      },
    ],
  },
  {
    id: "ideathon",
    name: "아이디어톤",
    subtitle: "캠퍼스 중고마켓",
    status: "done",
    role: "기획",
    startedAt: "5/12",
    representativeCards: [
      { cardId: "card-13-a", recordIds: ["ideathon-1"] },
      { cardId: "card-13-b", recordIds: ["ideathon-3"] },
    ],
    shape: "sunFine",
    color: "muted",
    records: [
      {
        id: "ideathon-3",
        date: "5/26",
        weekday: "월",
        did: "중간 발표 후 첫 화면 다시 설계",
        problem: "'첫 화면만 보고는 무슨 서비스인지 모르겠다'는 심사 코멘트",
        choice: "기능 버튼 6개를 걷어내고 한 줄 소개와 핵심 버튼 하나만 남김",
        result: "최종 발표에서 '한눈에 이해된다'는 평가",
        attachments: [{ id: "review-comment", kind: "pdf", name: "중간발표_심사코멘트.pdf" }],
      },
      {
        id: "ideathon-2",
        date: "5/19",
        weekday: "월",
        did: "캠퍼스 중고거래 경험자 5명 인터뷰",
        problem: "다들 '거래 장소 정하기'가 제일 번거롭다고 함",
        choice: "처음 기획한 가격 비교보다 장소 추천을 먼저 만들기로 바꿈",
        result: "핵심 기능을 '캠퍼스 거래 장소 추천'으로 확정",
        next: "프로토타입 5화면",
        attachments: [{ id: "interview-notes", kind: "notion", name: "인터뷰_정리_5명.zip" }],
      },
      {
        id: "ideathon-1",
        date: "5/12",
        weekday: "월",
        did: "팀 아이디어 6개 모으기",
        problem: "의견이 갈려 투표로도 결정이 안 남",
        choice: "평가 기준 3개를 먼저 정하고 점수 매기기",
        result: "30분 만에 하나로 합의",
        next: "인터뷰 질문 만들기",
        attachments: [],
      },
    ],
  },
];

export const MOCK_PROJECTS = PROJECTS.map((project) => ({
  ...project,
  recordCount: project.records.length,
  lastRecordedAt: project.records[0]?.date,
  cardCount: project.representativeCards.length,
}));

// 기록 추가의 AI 질문 목업이다. 시안에는 첫 질문만 있어서, 나머지는 명세(H-13)의 항목과 13-c의 정리 결과에 맞춰 만들었다.
// fieldKey: 답변이 정리되는 칸. attachmentKinds: 이 종류의 자료가 첨부됐을 때만 묻는다. 없으면 항상 묻는다.
export const MOCK_RECORD_QUESTIONS = [
  {
    fieldKey: "did",
    category: "내 역할",
    attachmentKinds: ["notion", "pdf"],
    question: "회의록을 보니 홈 화면에 무엇을 먼저 보여 줄지 논의했네요. 이 회의에서 내가 맡은 일은 뭐였어요?",
    exampleAnswer: "홈 시안 2개를 준비해서 비교 발표했어요. 회고 마감을 크게 보여 주는 안과, 프로젝트를 같이 보여 주는 안이요.",
  },
  {
    fieldKey: "problem",
    category: "과정",
    attachmentKinds: ["notion", "pdf"],
    question: "논의하면서 의견이 갈리거나 막힌 곳이 있었어요? 어떻게 풀었어요?",
    exampleAnswer: "개발자는 회고 하나만 크게, 저는 프로젝트도 같이 보여야 한다고 봤어요. 아기사자 3명에게 시안을 보여 주고 물어본 뒤 둘 다 보여 주기로 했어요.",
  },
  {
    fieldKey: "choice",
    category: "선택의 이유",
    attachmentKinds: ["image", "link"],
    question: "시안을 고를 때 가장 중요하게 본 건 뭐였어요?",
    exampleAnswer: "프로젝트 기록이 의무처럼 보이지 않게 하는 거요. 마감 표시는 회고에만 두고, 프로젝트엔 마지막 기록 날짜만 보여 줬어요.",
  },
  {
    fieldKey: "result",
    category: "근거와 숫자",
    question: "시안을 몇 명에게 보여 줬고, 반응은 어땠어요?",
    exampleAnswer: "물어본 3명 모두 두 번째 시안이 ‘할 일이 바로 보인다’고 했어요.",
  },
];
