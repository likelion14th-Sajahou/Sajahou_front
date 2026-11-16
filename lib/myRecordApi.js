import { authRequest } from "./auth.js";

// 역량 목록과 스토리 카드는 회고·나의 사자록·프로젝트·자소서 매칭이 함께 쓴다. 화면은 authenticatedRequest를 request로 넘긴다.
const TIMEOUT_MS = 15000;
const cardPath = (id) => `/story-cards/${encodeURIComponent(id)}`;

export function getCompetencies({ request = authRequest, signal } = {}) {
  return request("/competencies", { signal, timeoutMs: TIMEOUT_MS });
}
export function getStoryCard(id, { request = authRequest, signal } = {}) {
  return request(cardPath(id), { signal, timeoutMs: TIMEOUT_MS });
}
export function updateStoryCard(id, values, { request = authRequest, signal } = {}) {
  return request(cardPath(id), { method: "PATCH", body: values, signal, timeoutMs: TIMEOUT_MS });
}
// API 24의 초기화는 서버가 처리한다. 성공(204) 전에 화면에서 카드를 제거하거나 API 16을 따로 호출하지 않는다.
export function deleteStoryCard(id, { request = authRequest, signal } = {}) {
  return request(cardPath(id), { method: "DELETE", signal, timeoutMs: TIMEOUT_MS });
}
export function getFootprints({ request = authRequest, signal } = {}) {
  return request("/footprints", { signal, timeoutMs: TIMEOUT_MS });
}
export function getStoryCards(filters = {}, { request = authRequest, signal } = {}) {
  const query = Object.fromEntries(["type", "competencyId", "weekNumber", "q"]
    .filter((key) => filters[key] !== undefined && filters[key] !== null && filters[key] !== "")
    .map((key) => [key, filters[key]]));
  return request("/story-cards", { query, signal, timeoutMs: TIMEOUT_MS });
}
