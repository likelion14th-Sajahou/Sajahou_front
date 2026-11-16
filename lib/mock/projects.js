// 시안(12~14 프로젝트, 01 홈)의 표시 값이다. API 명세가 정해지면 실제 응답으로 교체한다.
// status: "active"(진행 중) | "done"(완료)
// records: 최신 기록이 앞에 온다. 칸이 비어 있으면 화면에 표시하지 않는다.
// recap: 프로젝트를 완료하면 받는 사자 발자국 주차와 이름이다. 없으면 스티커를 받지 않는다.
// 기록 1개는 나의 사자록의 프로젝트 카드 1장이 된다(H-22). tags는 기록을 저장할 때 고른 역량 태그이고, 카드에도 그대로 쓴다.
// organizedByAi: AI 질문으로 정리한 기록이면 true다. 목업 기록은 모두 직접 쓴 기록이다.
// endedAt: 프로젝트를 마친 날이다. 포트폴리오의 기간 끝에 쓴다.
// portfolio: 프로젝트를 마치며 저장한 포트폴리오 Markdown이다. 없으면 완료 프로젝트에서 '아직 포트폴리오가 없어요'를 보여 준다.

// 완료한 아이디어톤에 저장된 포트폴리오다. 시안 12-a의 글을 그대로 옮겼다.
const IDEATHON_PORTFOLIO = `# 아이디어톤 · 캠퍼스 중고마켓

- 기간: 5/12 ~ 6/9
- 역할: 기획

## 내 역할
(내 역할을 한 문장으로 더해 주세요)

## 주요 기여
- 5/12(월) 팀 아이디어 6개 모으기
- 5/19(월) 캠퍼스 중고거래 경험자 5명 인터뷰
- 5/26(월) 중간 발표 후 첫 화면 다시 설계

## 문제와 해결
- 문제: 의견이 갈려 투표로도 결정이 안 남 → 선택: 평가 기준 3개를 먼저 정하고 점수 매기기
- 문제: 다들 '거래 장소 정하기'가 제일 번거롭다고 함 → 선택: 처음 기획한 가격 비교보다 장소 추천을 먼저 만들기로 바꿈
- 문제: '첫 화면만 보고는 무슨 서비스인지 모르겠다'는 심사 코멘트 → 선택: 기능 버튼 6개를 걷어내고 한 줄 소개와 핵심 버튼 하나만 남김

## 결과
- 30분 만에 하나로 합의
- 핵심 기능을 '캠퍼스 거래 장소 추천'으로 확정
- 최종 발표에서 '한눈에 이해된다'는 평가

## 산출물
- 인터뷰_정리_5명.zip
- 중간발표_심사코멘트.pdf

## 배운 점
(한 줄 남겨 주세요)`;

export const MOCK_PROJECTS = [
  {
    id: "central-hackathon",
    name: "중앙해커톤",
    subtitle: "사자록 만들기",
    status: "active",
    roles: ["PM"],
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
    roles: ["기획"],
    startedAt: "5/12",
    endedAt: "6/9",
    portfolio: { markdown: IDEATHON_PORTFOLIO },
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
