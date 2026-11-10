import { authRequest } from "./auth.js";

// 회고 API(11~18번) 호출 함수다. NEXT_PUBLIC_AUTH_MODE가 mock이면 브라우저 mock이, live면 실제 백엔드가 응답한다.
// request에 AuthProvider의 authenticatedRequest를 주면 401일 때 로그인 상태를 정리한다.
const TIMEOUT_MS = 15000;
// AI 호출은 최대 50초 걸려서 요청 타임아웃을 60초보다 길게 둔다(API 명세 공통).
const AI_TIMEOUT_MS = 65000;
const path = (retrospectiveId, suffix = "") => `/retrospectives/${encodeURIComponent(retrospectiveId)}${suffix}`;

// 11. 이번 주 회고 조회
export function getCurrentRetrospective({ signal, request = authRequest } = {}) {
  return request("/retrospectives/current", { signal, timeoutMs: TIMEOUT_MS });
}

// 12. 회고 시작. 이미 시작한 회고가 있으면 그 회고를 돌려준다.
export function startRetrospective({ weekId, type = "SESSION", rested = false }, { signal, request = authRequest } = {}) {
  return request("/retrospectives", { method: "POST", body: { weekId, type, rested }, signal, timeoutMs: TIMEOUT_MS });
}

// 13. 회고 상세 조회
export function getRetrospective(retrospectiveId, { signal, request = authRequest } = {}) {
  return request(path(retrospectiveId), { signal, timeoutMs: TIMEOUT_MS });
}

// 14. 회고 임시저장. 보낸 필드만 바뀌고, null이면 비운다.
export function saveRetrospective(retrospectiveId, changes, { signal, request = authRequest } = {}) {
  return request(path(retrospectiveId), { method: "PATCH", body: changes, signal, timeoutMs: TIMEOUT_MS });
}

// 15. 휴회 표시·해제. 해제해도 쓰던 내용은 그대로다.
export function setRetrospectiveRest(retrospectiveId, rested, { signal, request = authRequest } = {}) {
  return request(path(retrospectiveId, "/rest"), { method: "PATCH", body: { rested }, signal, timeoutMs: TIMEOUT_MS });
}

// 16. 회고 처음부터. 자료·첨부·AI 질문·카드 초안을 지우며 되돌릴 수 없다.
export function resetRetrospective(retrospectiveId, { signal, request = authRequest } = {}) {
  return request(path(retrospectiveId, "/reset"), { method: "POST", signal, timeoutMs: TIMEOUT_MS });
}

// 17. AI 질문 받기. mode: AUTO(없으면 만들고 있으면 그대로) | CONTINUE(이전 질문 이어 쓰기) | REGENERATE(질문 새로 만들기)
// 답을 쓴 뒤 자료가 바뀌었으면 409 MATERIAL_CHANGED(error.detail.answeredCount)가 온다.
export function requestQuestions(retrospectiveId, mode = "AUTO", { signal, request = authRequest } = {}) {
  return request(path(retrospectiveId, "/questions"), { method: "POST", body: { mode }, signal, timeoutMs: AI_TIMEOUT_MS });
}

// 18. 질문 답하기·건너뛰기. 어느 질문이든 다시 보내면 답을 덮어쓴다.
export function answerQuestion(questionId, { status, answer }, { signal, request = authRequest } = {}) {
  const body = status === "ANSWERED" ? { status, answer } : { status };
  return request(`/questions/${encodeURIComponent(questionId)}`, { method: "PATCH", body, signal, timeoutMs: TIMEOUT_MS });
}
