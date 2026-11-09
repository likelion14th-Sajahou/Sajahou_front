// AI 질문 받기(API 17) mock이 쓰는 파트별 질문 세트다(R-24). 문구는 프로토타입의 질문 세트에서 가져왔다.
// 실제 질문은 백엔드 AI가 자료를 읽고 만든다. 이 파일은 화면 흐름 확인용이다.
// needs: practice(실습 내용) | assignment(과제 내용) | review(받은 코드리뷰) | session(세션 PDF) | any(세션 회고 마지막 느낀 점) | assign-any(과제 회고 마지막 느낀 점)
export const QUESTION_SETS = {
  PLAN_DESIGN: [
    { tag: "근거와 숫자", needs: "practice", content: "인터뷰에서 실제로 나온 말 중에 가장 기억에 남는 건 뭐였어요?" },
    { tag: "빠진 칸", needs: "assignment", content: "시안 중에 하나를 고른 이유는요?" },
    { tag: "세션과 연결", needs: "assignment", content: "이번 세션의 ‘기획 의도 거꾸로 읽기’로 보면, 원래 화면이 그렇게 생긴 이유는 뭐였을까요?" },
    { tag: "역량 신호", needs: "practice", content: "실습을 하면서 스스로 정한 방식이 있었나요?" },
    { tag: "세션과 연결", needs: "session", content: "이번 세션에서 가장 새로웠던 개념을 내 말로 정리하면요?" },
    { tag: "느낀 점", needs: "assign-any", content: "이번 과제에서 다음에도 가져가고 싶은 게 있다면요?" },
    { tag: "느낀 점", needs: "any", content: "이번 주에 다음에도 가져가고 싶은 게 하나 있다면요?" },
  ],
  FRONTEND: [
    { tag: "빠진 칸", needs: "assignment", content: "해결했다고 했는데, 왜 그 방법이 문제를 멈췄는지 설명해 볼래요?" },
    { tag: "근거와 숫자", needs: "assignment", content: "고친 뒤에 무엇이 어떻게 바뀌었어요? 확인한 방법이 있으면 알려 주세요." },
    { tag: "세션과 연결", needs: "practice", content: "실습에서 생긴 문제는 이번 세션의 useEffect 실행 시점과 어떻게 연결돼요?" },
    { tag: "세션과 연결", needs: "session", content: "이번 세션에서 가장 새로웠던 개념을 내 말로 정리하면요?" },
    { tag: "역량 신호", needs: "assignment", content: "공식 문서에서 찾아본 것 중에 세션에서 안 다룬 내용이 있었어요?" },
    { tag: "받은 리뷰", needs: "review", content: "받은 코드리뷰 중에 다음 과제에서 하나만 적용해 본다면요?" },
    { tag: "느낀 점", needs: "assign-any", content: "이번 과제에서 가장 크게 배운 한 가지는요?" },
    { tag: "느낀 점", needs: "any", content: "이번 주 세션에서 다음에 꼭 써 보고 싶은 개념 하나는요?" },
  ],
  BACKEND: [
    { tag: "근거와 숫자", needs: "assignment", content: "문제를 어떻게 알아챘어요? 바꾼 뒤엔 숫자가 어떻게 달라졌어요?" },
    { tag: "빠진 칸", needs: "assignment", content: "중간에 뜬 경고나 오류는 어떻게 처리했어요?" },
    { tag: "선택의 이유", needs: "assignment", content: "여러 방법 중에 지금 방법을 고른 기준이 있었나요?" },
    { tag: "세션과 연결", needs: "practice", content: "헷갈렸던 개념은 어떻게 정리했어요? 직접 확인해 본 게 있나요?" },
    { tag: "세션과 연결", needs: "session", content: "이번 세션에서 배운 내용을 내 말로 한 줄 정리하면요?" },
    { tag: "느낀 점", needs: "any", content: "이번 주 세션에서 가장 크게 배운 한 가지는요?" },
    { tag: "느낀 점", needs: "assign-any", content: "이번 과제에서 가장 크게 배운 한 가지는요?" },
  ],
};

const TAIL_NEEDS = ["any", "assign-any"];

// 자료의 첫 줄을 근거 문장으로 쓴다. 너무 길면 줄인다.
function firstLine(value) {
  const line = value?.split("\n").map((item) => item.trim()).find(Boolean);
  if (!line) return null;
  return line.length > 24 ? `${line.slice(0, 24)}…` : line;
}

// 자료로 물어볼 질문을 고른다(R-15). 앞에서 최대 4개 + 마지막 느낀 점 1개.
// 자료가 하나도 없으면 빈 배열이다(insufficientMaterial).
export function pickQuestions({ type, materials, attachments, part }) {
  const isSession = type === "SESSION";
  const sources = {
    practice: isSession && materials.hasPractice !== false ? materials.practiceContent : null,
    assignment: !isSession || (materials.assignmentMode ?? "RECORD") === "RECORD" ? materials.assignmentContent : null,
    review: materials.codeReview,
    session: isSession ? attachments.find(({ category }) => category === "SESSION_PDF")?.name ?? null : null,
    memo: materials.memo,
  };
  const hasMaterial = Object.values(sources).some((value) => value?.trim()) || attachments.length > 0;
  if (!hasMaterial) return [];

  const usable = (QUESTION_SETS[part] ?? QUESTION_SETS.PLAN_DESIGN).filter(({ needs }) => {
    if (needs === "any") return isSession;
    if (needs === "assign-any") return !isSession;
    return Boolean(sources[needs]?.trim());
  });
  const body = usable.filter(({ needs }) => !TAIL_NEEDS.includes(needs)).slice(0, 4);
  const tail = usable.filter(({ needs }) => TAIL_NEEDS.includes(needs)).slice(0, 1);
  // 마지막 느낀 점처럼 특정 문장에서 나오지 않은 질문은 근거 문장이 없다(null).
  return [...body, ...tail].map(({ tag, needs, content }) => ({ tag, content, quote: TAIL_NEEDS.includes(needs) ? null : firstLine(sources[needs]) }));
}
