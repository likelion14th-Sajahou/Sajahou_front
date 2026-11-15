import { notFound } from "../mockResponse.js";
import { mockFootprints } from "../myRecordModel.js";
import { removeRecord, text } from "../projectModel.js";
import { MOCK_WEEK } from "../week.js";

// 프로젝트 카드는 그 프로젝트의 종류(category, #82)를 함께 돌려준다. 회고 카드와 종류가 없는 예전 프로젝트는 null이다.
const withCategory = (state, card) => ({ ...card, category: card.type === "PROJECT" ? state.projects[card.projectId]?.category ?? null : null });

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
    return save({ totalCount: cards.length, cards: cards.map((card) => withCategory(state, card)).map(({ cardId, type, weekNumber, projectId, projectName, category, title, competencies, evidenceSummary }) => ({ cardId, type, weekNumber, projectId, projectName, category, title, competencies, evidenceSummary })) });
  }
  if (split[0] === "story-cards" && split.length === 2) {
    const card = state.cards[decodeURIComponent(split[1])];
    if (!card) return notFound();
    if (method === "GET") return save(withCategory(state, card));
    if (method === "DELETE") {
      // 프로젝트 카드를 지우면 연결된 기록도 지운다(H-22).
      if (card.type === "PROJECT") removeRecord(state, card.sourceRecords[0].recordId);
      else delete state.cards[card.cardId];
      return save(undefined, 204);
    }
    if (method === "PATCH") {
      if (body.competencyIds !== undefined) {
        // 초안 카드는 태그 0개로도 저장할 수 있고, 공개된 카드는 1~3개다(API 23).
        const isEmptyDraft = card.status === "DRAFT" && Array.isArray(body.competencyIds) && body.competencyIds.length === 0;
        const competencies = isEmptyDraft ? [] : findTags(body.competencyIds);
        if (!competencies) return tagError();
        card.competencies = competencies;
      }
      for (const k of ["title", "situation", "action", "reason", "result", "learned", "fullMarkdown"]) if (Object.hasOwn(body, k)) card[k] = text(body[k]);
      card.blanks = ["situation", "action", "reason", "result", "learned"].filter((k) => !card[k]);
      return save(withCategory(state, card));
    }
  }
  return undefined;
}
