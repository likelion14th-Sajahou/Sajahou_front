import { notFound } from "../mockResponse.js";
import { mockFootprints, weekCards } from "../myRecordModel.js";
import { removeRecord, text } from "../projectModel.js";
import { MOCK_WEEK } from "../week.js";

// 프로젝트 카드는 그 프로젝트의 종류(category, #82)를 함께 돌려준다. 회고 카드와 종류가 없는 예전 프로젝트는 null이다.
const withCategory = (state, card) => ({ ...card, category: card.type === "PROJECT" ? state.projects[card.projectId]?.category ?? null : null });

// 5. 사자 발자국 조회, 21~24. 스토리 카드 목록·상세·수정·삭제
export function handleStoryCards({ url, path, split, method, body, state, save, findTags, tagError }) {
  if (path === "/footprints" && method === "GET") return save(mockFootprints(state));
  if (path === "/story-cards" && method === "GET") {
    const query = new URL(url).searchParams;
    // 주차로 거르면 발표 주에는 완료한 프로젝트의 카드도 함께 온다(/footprints cardIds와 같은 기준). 다른 필터도 함께 적용한다.
    const weekCardIds = query.get("weekNumber") ? new Set(weekCards(state, Number(query.get("weekNumber"))).map((card) => card.cardId)) : null;
    const cards = Object.values(state.cards).filter((card) => card.status === "PUBLISHED" &&
      (!query.get("type") || query.get("type") === card.type) &&
      (!weekCardIds || weekCardIds.has(card.cardId)) &&
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
      else {
        delete state.cards[card.cardId];
        // API 24: 회고 카드 삭제는 자료·질문·답·첨부까지 초기화한다.
        for (const retrospective of Object.values(state.retrospectives)) {
          if (retrospective.cardId !== card.cardId) continue;
          for (const [id, question] of Object.entries(state.questions)) {
            if (question.retrospectiveId === retrospective.id) delete state.questions[id];
          }
          for (const id of retrospective.attachmentIds) delete state.attachments[id];
          Object.assign(retrospective, {
            state: "IN_PROGRESS", currentStep: 2, lastSavedAt: null, completedAt: null,
            materials: Object.fromEntries(Object.keys(retrospective.materials).map((key) => [key, null])),
            attachmentIds: [], questionSnapshot: null, cardId: null, resetByCardDeletion: true,
          });
          delete retrospective.stateBeforeRest;
        }
      }
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
