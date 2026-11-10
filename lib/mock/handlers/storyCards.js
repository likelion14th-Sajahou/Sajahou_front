import { notFound } from "../mockResponse.js";
import { mockFootprints } from "../myRecordModel.js";
import { removeRecord, text } from "../projectModel.js";
import { MOCK_WEEK } from "../week.js";

// 5. 사자 발자국 조회, 21~24. 스토리 카드 목록·상세·수정·삭제
export function handleStoryCards({ url, path, split, method, body, state, save, findTags, tagError }) {
  if (path === "/footprints" && method === "GET") return save(mockFootprints(state));
  if (path === "/story-cards" && method === "GET") {
    const query = new URL(url).searchParams;
    const cards = Object.values(state.cards).filter((card) => card.status === "PUBLISHED" &&
      (!query.get("type") || query.get("type") === card.type) &&
      (!query.get("weekNumber") || String(card.weekNumber) === query.get("weekNumber")) &&
      (!query.get("competencyId") || card.competencies.some((c) => String(c.id) === query.get("competencyId"))) &&
      (!query.get("q") || `${card.title} ${card.competencies.map((c) => c.name).join(" ")} ${card.evidenceSummary.join(" ")}`.toLowerCase().includes(query.get("q").trim().toLowerCase())))
      .sort((a, b) => (b.weekNumber ?? MOCK_WEEK.week) - (a.weekNumber ?? MOCK_WEEK.week) || String(b.cardId).localeCompare(String(a.cardId), "en", { numeric: true }));
    return save({ totalCount: cards.length, cards: cards.map(({ cardId, type, weekNumber, projectId, projectName, title, competencies, evidenceSummary }) => ({ cardId, type, weekNumber, projectId, projectName, title, competencies, evidenceSummary })) });
  }
  if (split[0] === "story-cards" && split.length === 2) {
    const card = state.cards[decodeURIComponent(split[1])];
    if (!card) return notFound();
    if (method === "GET") return save(card);
    if (method === "DELETE") {
      // 프로젝트 카드를 지우면 연결된 기록도 지운다(H-22).
      if (card.type === "PROJECT") removeRecord(state, card.sourceRecords[0].recordId);
      else delete state.cards[card.cardId];
      return save(undefined, 204);
    }
    if (method === "PATCH") {
      if (body.competencyIds !== undefined) { const competencies = findTags(body.competencyIds); if (!competencies) return tagError(); card.competencies = competencies; }
      for (const k of ["title", "situation", "action", "reason", "result", "learned", "fullMarkdown"]) if (Object.hasOwn(body, k)) card[k] = text(body[k]);
      card.blanks = ["situation", "action", "reason", "result", "learned"].filter((k) => !card[k]);
      return save(card);
    }
  }
  return undefined;
}
