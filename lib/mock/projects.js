// 시안(12~14 프로젝트, 01 홈)의 표시 값이다. API 명세가 정해지면 실제 응답으로 교체한다.
// status: "active"(진행 중) | "done"(완료)
// records: 최신 기록이 앞에 온다. 칸이 비어 있으면 화면에 표시하지 않는다.
// recap: 프로젝트를 완료하면 받는 사자 발자국 주차와 이름이다. 없으면 스티커를 받지 않는다.
// 기록 1개는 나의 사자록의 프로젝트 카드 1장이 된다(H-22). tags는 기록을 저장할 때 고른 역량 태그이고, 카드에도 그대로 쓴다.
// organizedByAi: AI 질문으로 정리한 기록이면 true다. 목업 기록은 모두 직접 쓴 기록이다.
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

export const MOCK_PROJECTS = [
  {
    id: "central-hackathon",
    name: "중앙해커톤",
    subtitle: "사자록 만들기",
    status: "active",
    role: "PM",
    startedAt: "10/30",
    recap: { week: 38, title: "중커톤 발표·회고" },
    shape: "sunFine",
    color: "yellow",
    records: [
      {
        id: "central-hackathon-2",
        date: "11/1",
        weekday: "일",
        tags: ["사용자 리서치", "협업"],
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
        tags: ["기능 기획", "의사결정"],
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
    shape: "sunFine",
    color: "muted",
    records: [
      {
        id: "ideathon-3",
        date: "5/26",
        weekday: "월",
        tags: ["피드백 수용", "UX 설계"],
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
        tags: ["사용자 리서치", "문제 정의"],
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
        tags: ["갈등 조율", "의사결정"],
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

// 포트폴리오의 "AI가 찾은 빈 곳" 목업이다(H-17).
// kind: "question"(답변) | "artifacts"(산출물 첨부 요청)
export const MOCK_PORTFOLIO_GAPS = [
  {
    id: "role",
    kind: "question",
    category: "내 역할",
    tone: "red",
    gap: "기록마다 역할이 흩어져 있어요",
    question: "프로젝트 전체에서 내가 맡은 범위를 한 문장으로 말하면요?",
  },
  {
    id: "result",
    kind: "question",
    category: "최종 결과",
    tone: "red",
    gap: "프로젝트 끝의 결과가 기록에 없어요",
    question: "최종 결과는 어땠어요? 시연, 수상, 사용자 반응처럼 확인할 수 있는 것만요.",
  },
  {
    id: "evidence",
    kind: "question",
    category: "근거와 숫자",
    tone: "red",
    gap: "결과에 숫자가 거의 없어요",
    question: "숫자로 보여 줄 수 있는 게 있나요? 기간, 인터뷰 인원, 사용자 수처럼요.",
  },
  {
    id: "artifacts",
    kind: "artifacts",
    category: "산출물 요청",
    tone: "blue",
    gap: "최종 산출물이 아직 첨부되지 않았어요",
    question: "포트폴리오에 넣을 산출물을 첨부해 주세요. 최종 발표 자료, 시연 링크, 피그마가 있으면 좋아요.",
  },
  {
    id: "learned",
    kind: "question",
    category: "배운 점",
    tone: "red",
    gap: "프로젝트 전체를 돌아본 문장이 없어요",
    question: "다음 프로젝트에 꼭 가져갈 한 가지는요?",
  },
];

// 빈 곳의 "예시 답변 넣기"에 쓰는 값이다. 중앙해커톤은 시안 14의 글에서 가져왔고, 아이디어톤은 기록에 맞춰 만들었다.
export const MOCK_PORTFOLIO_EXAMPLES = {
  "central-hackathon": {
    role: "PM으로 범위를 정하고, AI 질문 설계와 IR 자료를 맡았어요.",
    result: "중커톤 시연에서 아기사자 12명이 직접 회고를 써 봤어요.",
    evidence: "18일 개발, 사용자 인터뷰 5명, 시연 참여 12명.",
    artifacts: [
      { id: "final-deck", kind: "pdf", name: "중앙해커톤_최종발표.pdf" },
      { id: "demo-link", kind: "link", name: "sajarok.netlify.app" },
    ],
    learned: "확정하기 전에 실제 사용자에게 한 번 더 물어보기.",
  },
  ideathon: {
    role: "기획으로 인터뷰를 맡아 핵심 기능을 정했어요.",
    result: "최종 발표에서 '한눈에 이해된다'는 평가를 받았어요.",
    evidence: "인터뷰 5명, 아이디어 6개 중 1개 선정, 프로토타입 5화면.",
    artifacts: [{ id: "ideathon-deck", kind: "pdf", name: "아이디어톤_최종발표.pdf" }],
    learned: "기능을 고르기 전에 사용자에게 먼저 물어보기.",
  },
};

// 대표 카드 초안에서 기록만으로 만들 수 없는 값의 목업이다. 실제로는 AI가 고른다.
// 시안 14에 있는 중앙해커톤의 첫 카드만 값을 정해 두고, 나머지는 시안 12-f의 태그와 제목 형식을 쓴다.
export const MOCK_PORTFOLIO_CARD = {
  firstCardByProject: {
    "central-hackathon": {
      title: "범위를 나누고 사용자에게 다시 확인해 방향을 잡은 경험",
      tags: ["사용자 리서치", "문제 정의", "의사결정"],
    },
  },
  defaultTags: ["사용자 리서치", "주도성"],
};
