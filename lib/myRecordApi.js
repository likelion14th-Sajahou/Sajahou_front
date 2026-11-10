import { authRequest } from "./auth.js";
import { getProjectCompetencies, getProjectCard, updateProjectCard, deleteProjectCard } from "./projectApi.js";

// 같은 카드 계약을 프로젝트 화면과 공유한다. 화면은 authenticatedRequest를 request로 넘긴다.
export const getCompetencies = getProjectCompetencies;
export const getStoryCard = getProjectCard;
export const deleteStoryCard = deleteProjectCard;
export const updateStoryCard = updateProjectCard;
export function getFootprints({ request = authRequest, signal } = {}) {
  return request("/footprints", { signal, timeoutMs: 15000 });
}
export function getStoryCards(filters = {}, { request = authRequest, signal } = {}) {
  const query = Object.fromEntries(["type", "competencyId", "weekNumber", "q"]
    .filter((key) => filters[key] !== undefined && filters[key] !== null && filters[key] !== "")
    .map((key) => [key, filters[key]]));
  return request("/story-cards", { query, signal, timeoutMs: 15000 });
}
