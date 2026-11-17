import { getCurrentRetrospective } from "./retrospectiveApi.js";

// API 12의 200(기존 회고)·201(새 회고) 응답을 바로 반영한다.
// 삭제 후 API 11은 다시 저장하기 전까지 NOT_STARTED일 수 있으므로 시작 결과를 재조회로 덮지 않는다.
export function applyStartedRetrospective(current, { id, type, state, currentStep }) {
  const key = type === "ASSIGNMENT" ? "assignment" : "session";
  return { ...current, [key]: { ...current[key], id, state, currentStep } };
}

// 이번 주차 과제만 선택한다. 다른 주차와 이미 완료된 회고의 상태는 그대로 유지한다.
export async function loadCurrentRetrospective(options) {
  const current = await getCurrentRetrospective(options);
  const open = current.openAssignments.find(({ weekNumber }) => weekNumber === current.week.weekNumber);
  const assignment = open
    ? { id: open.id, state: open.state, currentStep: open.currentStep ?? 1, lastSavedAt: open.lastSavedAt, deadline: open.deadline }
    : null;
  return { ...current, assignment };
}
