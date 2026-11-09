import { authRequest } from "./auth.js";

// 회고 API(11~16번) 호출 함수다. NEXT_PUBLIC_AUTH_MODE가 mock이면 브라우저 mock이, live면 실제 백엔드가 응답한다.
// request에 AuthProvider의 authenticatedRequest를 주면 401일 때 로그인 상태를 정리한다.
const TIMEOUT_MS = 15000;
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
