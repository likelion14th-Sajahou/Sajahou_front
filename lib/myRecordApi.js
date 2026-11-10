import { projectRequest, getProjectCompetencies, getProjectCard, updateProjectCard, deleteProjectCard } from "./projectApi.js";

// 같은 카드 계약과 세션 만료 처리를 프로젝트 화면과 공유한다.
export const getCompetencies = getProjectCompetencies;
export const getStoryCard = getProjectCard;
export const deleteStoryCard = deleteProjectCard;
export const updateStoryCard = updateProjectCard;
export function getFootprints({ request = projectRequest, signal } = {}) {
  return request("/footprints", { signal, timeoutMs: 15000 });
}
export function getStoryCards(filters = {}, { request = projectRequest, signal } = {}) {
  const query = Object.fromEntries(["type", "competencyId", "weekNumber", "q"]
    .filter((key) => filters[key] !== undefined && filters[key] !== null && filters[key] !== "")
    .map((key) => [key, filters[key]]));
  return request("/story-cards", { query, signal, timeoutMs: 15000 });
}
