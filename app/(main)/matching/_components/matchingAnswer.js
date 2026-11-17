// 문항별 답 초안(37번 응답)을 화면·복사용 글로 바꾸는 함수들이다. 결과 목록과 답 카드가 함께 쓴다.

// 출처 표시(M-09): ① 추천 카드, ② 보조 카드, ③ 지원 공고
export const SOURCE_MARKS = { 1: "①", 2: "②", 3: "③" };

// 초안 글. 빈칸은 '[결과 · 숫자나 받은 반응을 채워 주세요]'처럼 대괄호로 남긴다(M-10).
export function answerText(answer) {
  return answer.segments.map((segment) => (segment.type === "blank" ? `[${segment.hint}]` : segment.text)).join(" ");
}

// 직접 고친 글의 글자 수와 빈칸 수. 대괄호로 남은 빈칸은 글자 수에서 뺀다(M-11).
const BLANK = /\[[^\]]*\]/g;
export const countCharacters = (text) => text.replace(BLANK, "").length;
export const countBlanks = (text) => (text.match(BLANK) ?? []).length;

// 같은 출처 문장이 이어지면 마지막 문장에만 출처를 붙인다(M-09). 빈칸이 끼면 이어진 것으로 보지 않는다.
export function showsSourceMark(segments, index) {
  const segment = segments[index];
  const next = segments[index + 1];
  return Boolean(segment.source) && !(next?.type === "text" && next.source === segment.source);
}

// '이 답에 쓴 기록'의 출처 기록명(M-12): 프로젝트 카드는 '프로젝트 이름 기록', 회고 카드는 주차.
export function cardSourceLabel(card) {
  if (card.type === "PROJECT") return `${card.projectName ?? "프로젝트"} 기록`;
  return `${card.weekNumber}주차 ${card.type === "ASSIGNMENT" ? "과제" : "회고"}`;
}
