import { getCurrentRetrospective, getRetrospective } from "./retrospectiveApi.js";

function needsDraftCheck(session) {
  return session.id != null && session.state === "IN_PROGRESS"
    && session.currentStep === 2 && session.lastSavedAt === null;
}

// 휴회 해제 응답은 빈 회고도 IN_PROGRESS/2로 반환한다. 서버 상태는 바꾸지 않고 시작 화면만 구분한다.
export function retrospectiveStartState(session, detail) {
  if (!needsDraftCheck(session) || !detail || detail.id !== session.id
    || detail.state !== "IN_PROGRESS" || detail.currentStep !== 2 || detail.lastSavedAt !== null) return session.state;

  const untouched = detail.materials != null
    && Object.values(detail.materials).every((value) => value === null || value === "")
    && Array.isArray(detail.attachments) && detail.attachments.length === 0
    && Array.isArray(detail.questions) && detail.questions.length === 0
    && detail.card === null;
  return untouched ? "NOT_STARTED" : session.state;
}

// 서버 완료 상태는 유지한다. 카드 삭제 직후(5단계)는 시작하기, 다시 저장한 2~4단계는 기존 이어쓰기를 사용한다.
export function retrospectiveScreenState(retrospective) {
  if (retrospective?.state === "COMPLETED") {
    if (retrospective.card === null) return retrospective.currentStep >= 2 && retrospective.currentStep <= 4 ? "IN_PROGRESS" : "NOT_STARTED";
    if (retrospective.card?.status === "DRAFT") return "IN_PROGRESS";
  }
  return retrospective?.state ?? "NOT_STARTED";
}

async function withCompletedCard(retrospective, options) {
  if (!retrospective?.id || retrospective.state !== "COMPLETED") return retrospective;
  const detail = await getRetrospective(retrospective.id, options);
  return { ...retrospective, card: detail.card };
}

// 이번 주차 회고만 선택하고, 완료 상태와 화면 표시용 카드 상태를 별도로 관리한다.
export async function loadRetrospectivePreview(options) {
  const current = await getCurrentRetrospective(options);
  let session = current.session;
  if (needsDraftCheck(session)) {
    const detail = await getRetrospective(session.id, options);
    session = { ...session, state: retrospectiveStartState(session, detail) };
  }
  const open = current.openAssignments.find(({ weekNumber }) => weekNumber === current.week.weekNumber);
  let assignment = open
    ? { id: open.id, state: open.state, currentStep: open.currentStep ?? 1, lastSavedAt: open.lastSavedAt, deadline: open.deadline }
    : null;
  [session, assignment] = await Promise.all([withCompletedCard(session, options), withCompletedCard(assignment, options)]);
  return { ...current, session, assignment };
}
