import { MOCK_STORAGE_PREFIX } from "./server.js";
import { MOCK_WEEK } from "./week.js";

// 완료 화면의 '데모 처음부터 다시 보기'(06, 시연 전용). 이번 주 회고와 그 질문·첨부·카드, 발자국을 mock 저장소에서 지운다.
// 실제 서비스에는 없는 동작이라 API를 만들지 않고 mock 모드에서만 쓴다.
export function resetMockWeek(storage, userId) {
  const key = `${MOCK_STORAGE_PREFIX}${userId}`;
  const raw = storage.getItem(key);
  if (!raw) return;
  const state = JSON.parse(raw);
  for (const retrospective of Object.values(state.retrospectives ?? {}).filter(({ weekId }) => weekId === MOCK_WEEK.week)) {
    for (const question of Object.values(state.questions)) {
      if (question.retrospectiveId === retrospective.id) delete state.questions[question.questionId];
    }
    for (const attachmentId of retrospective.attachmentIds) delete state.attachments[attachmentId];
    if (retrospective.cardId) delete state.cards[retrospective.cardId];
    delete state.retrospectives[retrospective.id];
  }
  state.completedWeeks = (state.completedWeeks ?? []).filter((week) => week !== MOCK_WEEK.week);
  storage.setItem(key, JSON.stringify(state));
}
