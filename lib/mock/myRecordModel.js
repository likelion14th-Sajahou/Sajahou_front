import { MOCK_STORY_CARDS } from "./storyCards.js";
import { FOOTPRINT_WEEKS, FOOTPRINT_SECTIONS } from "./myRecord.js";
import { MOCK_WEEK } from "./week.js";
import { competenciesFor, emptyState } from "./projectModel.js";
import { CATEGORY_PRESENTATION_WEEKS } from "../projectStickers.js";

// 데모 시안에서 이미 끝낸 프로젝트(아이디어톤·해커톤)의 스티커다. 이 Mock 저장소에는 그 프로젝트 데이터가 없다.
const SEEDED_PROJECT_STICKERS = ["IDEATHON", "HACKATHON"];

// 회고 화면은 아직 로컬 Mock이므로 같은 API 저장소에 저장 결과만 연결한다.
export function saveMockWeek(storage, user, card, resetWeek) {
  const key = `sajarok_mock_v1:${user.id}`;
  const raw = storage.getItem(key);
  const state = raw ? JSON.parse(raw) : emptyState();
  initializeMyRecord(state, user.part);
  if (resetWeek !== undefined) {
    for (const existing of Object.values(state.cards)) {
      if (existing.type !== "PROJECT" && existing.weekNumber === resetWeek) delete state.cards[existing.cardId];
    }
    state.completedWeeks = state.completedWeeks.filter((week) => week !== resetWeek);
  } else {
    state.cards[card.id] = mockCardFromView(card, user.part);
    state.completedWeeks = [...new Set([...state.completedWeeks, card.week])];
  }
  storage.setItem(key, JSON.stringify(state));
}

export function mockCardFromView(card, part) {
  const tags = competenciesFor(part);
  const competencies = card.tags.map((name) => tags.find((tag) => tag.name === name)).filter(Boolean);
  return { cardId: card.id, type: card.type.toUpperCase(), status: "PUBLISHED", weekNumber: card.week,
    projectId: null, projectName: null, title: card.title, ...card.summary,
    fullMarkdown: card.document, competencies: (competencies.length ? competencies : [tags[0]]).map(({ id, name }) => ({ id, name })),
    blanks: Object.entries(card.summary).filter(([, value]) => !value).map(([key]) => key),
    evidence: {}, evidenceSummary: [card.evidence], sourceRecords: null, deletedRecordCount: 0 };
}
export function initializeMyRecord(state, part) {
  if (state.myRecordSeeded) return;
  for (const card of MOCK_STORY_CARDS.filter((card) => card.type !== "project")) {
    state.cards[card.id] = mockCardFromView(card, part);
  }
  state.completedWeeks = FOOTPRINT_WEEKS.filter((week) => week.status === "done").map((week) => week.week);
  state.seededProjectStickers = SEEDED_PROJECT_STICKERS;
  state.myRecordSeeded = true;
}
// 백엔드 규칙: 그 종류의 프로젝트를 하나라도 완료(DONE)하면 그 종류의 발표 주에 스티커 하나가 붙는다.
// 발표 주 전(UPCOMING)이어도 붙고, 같은 종류를 여러 개 완료해도 하나다.
function projectStickersByWeek(state) {
  const done = Object.values(state.projects ?? {}).filter((p) => p.status === "DONE" && p.category).map((p) => p.category);
  const categories = new Set([...(state.seededProjectStickers ?? SEEDED_PROJECT_STICKERS), ...done]);
  const byWeek = {};
  for (const category of categories) (byWeek[CATEGORY_PRESENTATION_WEEKS[category]] ??= []).push(category);
  return byWeek;
}
export function mockFootprints(state) {
  const stickers = projectStickersByWeek(state);
  return { currentWeekNumber: MOCK_WEEK.week, weeks: FOOTPRINT_WEEKS.map((week) => {
    const section = FOOTPRINT_SECTIONS.find((section) => week.week >= section.startWeek && week.week <= section.endWeek);
    const status = state.completedWeeks.includes(week.week) ? "COMPLETED"
      : week.week === MOCK_WEEK.week ? "THIS_WEEK" : week.week > MOCK_WEEK.week ? "UPCOMING" : "NO_RECORD";
    return { weekNumber: week.week, phase: section.id.replaceAll("-", "_").toUpperCase(), status,
      isCurrent: week.week === MOCK_WEEK.week, isPresentationWeek: [13, 27, 38].includes(week.week),
      sessionTitle: status === "UPCOMING" ? null : week.title,
      cardIds: Object.values(state.cards).filter((card) => card.status === "PUBLISHED" && card.weekNumber === week.week).map((card) => card.cardId),
      stickers: stickers[week.week] ?? [] };
  }) };
}
