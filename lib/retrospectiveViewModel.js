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

// 이번 주차 과제만 선택한다. 다른 주차와 이미 완료된 회고의 상태는 그대로 유지한다.
export async function loadRetrospectivePreview(options) {
  const current = await getCurrentRetrospective(options);
  let session = current.session;
  if (needsDraftCheck(session)) {
    const detail = await getRetrospective(session.id, options);
    session = { ...session, state: retrospectiveStartState(session, detail) };
  }
  const open = current.openAssignments.find(({ weekNumber }) => weekNumber === current.week.weekNumber);
  const assignment = open
    ? { id: open.id, state: open.state, currentStep: open.currentStep ?? 1, lastSavedAt: open.lastSavedAt, deadline: open.deadline }
    : null;
  return { ...current, session, assignment };
}
