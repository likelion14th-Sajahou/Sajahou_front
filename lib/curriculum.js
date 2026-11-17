// 나의 사자록·홈·프로젝트 카드에서 사용하는 14기 커리큘럼 정보다.

// 커리큘럼 구간. phase는 GET /footprints가 주마다 주는 값이고(백엔드 표, 11/15), id는 주소(?section=)에 쓴다.
// 실제 화면의 구간 범위는 응답의 phase로 만든다(myRecordViewModel). 여기 주차 범위는 프로젝트 발표 주에 쓴다.
// 프로젝트 구간의 마지막 주가 발표 주다(아이디어톤 12 · 해커톤 27 · 중커톤 38).
export const FOOTPRINT_SECTIONS = [
  { id: "regular-1", phase: "REGULAR_1", label: "정기 세션 1", startWeek: 1, endWeek: 9 },
  { id: "ideathon", phase: "IDEATHON", label: "아이디어톤", startWeek: 10, endWeek: 12, isProject: true },
  { id: "regular-2", phase: "REGULAR_2", label: "정기 세션 2", startWeek: 13, endWeek: 20 },
  { id: "hackathon", phase: "HACKATHON", label: "해커톤", startWeek: 21, endWeek: 27, isProject: true },
  { id: "regular-3", phase: "REGULAR_3", label: "정기 세션 3", startWeek: 28, endWeek: 34 },
  { id: "central-hackathon", phase: "JUNGKATHON", label: "중커톤", startWeek: 35, endWeek: 38, isProject: true },
  { id: "closing", phase: "WRAP_UP", label: "마무리", startWeek: 39, endWeek: 39 },
];

// 회고를 마친 주에 붙는 스티커의 모양·색이다(시안). 여기 없는 주는 기본 스티커(파란 원)를 쓴다.
// 프로젝트 발표 주(12·27)는 노란 해다.
export const WEEK_STICKERS = {
  1: { shape: "circle", color: "blue" },
  2: { shape: "square", color: "green" },
  3: { shape: "triangle", color: "coral" },
  4: { shape: "semicircle", color: "yellow" },
  5: { shape: "pentagon", color: "coral" },
  6: { shape: "flower", color: "blue" },
  7: { shape: "circle", color: "green" },
  9: { shape: "square", color: "yellow" },
  10: { shape: "triangle", color: "green" },
  11: { shape: "semicircle", color: "coral" },
  12: { shape: "sun", color: "yellow" },
  13: { shape: "pentagon", color: "yellow" },
  14: { shape: "flower", color: "coral" },
  15: { shape: "circle", color: "blue" },
  17: { shape: "square", color: "green" },
  18: { shape: "triangle", color: "coral" },
  19: { shape: "semicircle", color: "yellow" },
  20: { shape: "pentagon", color: "coral" },
  21: { shape: "flower", color: "blue" },
  22: { shape: "circle", color: "green" },
  23: { shape: "square", color: "yellow" },
  24: { shape: "triangle", color: "green" },
  25: { shape: "semicircle", color: "coral" },
  26: { shape: "pentagon", color: "yellow" },
  27: { shape: "sun", color: "yellow" },
  29: { shape: "flower", color: "coral" },
  30: { shape: "circle", color: "blue" },
  31: { shape: "square", color: "green" },
  32: { shape: "triangle", color: "coral" },
  33: { shape: "semicircle", color: "yellow" },
};
