import { apiRequest } from "./apiClient.js";
import { getAuthMode } from "./authConfig.js";

export const AI_TIMEOUT_MS = 65000;

const unauthorizedListeners = new Set();
export function subscribeProjectUnauthorized(listener) {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

// 화면은 이 함수의 출처를 구분하지 않는다. live에서는 기존 세션 쿠키 Client를 사용한다.
export async function projectRequest(path, options = {}) {
  // 요청 도중 로그인 상태가 바뀌면 이전 요청의 401로 새 세션을 해제하지 않는다.
  const listeners = [...unauthorizedListeners];
  try {
    if (getAuthMode() === "mock") {
      const { mockServerFetch } = await import("./mock/server.js");
      return await apiRequest(path, { ...options, cache: "no-store", baseUrl: window.location.origin, fetcher: mockServerFetch });
    }
    return await apiRequest(path, { ...options, cache: "no-store" });
  } catch (error) {
    if (error.status === 401 && error.kind !== "aborted" && !options.signal?.aborted) {
      for (const listener of listeners) if (unauthorizedListeners.has(listener)) listener();
    }
    throw error;
  }
}

const segment = (id) => encodeURIComponent(id);
const pick = (values, keys) => Object.fromEntries(keys.filter((key) => values[key] !== undefined).map((key) => [key, values[key]]));
function send(path, method, body, { request = projectRequest, signal, timeoutMs = 15000 } = {}) {
  return request(path, { method, body, signal, timeoutMs });
}
export const getProjectHome = (options) => send("/home", "GET", undefined, options);
export const getProjectCompetencies = (options) => send("/competencies", "GET", undefined, options);
export const listProjects = (options) => send("/projects", "GET", undefined, options);
export const getProject = (id, options) => send(`/projects/${segment(id)}`, "GET", undefined, options);
export const createProject = (values, options) => send("/projects", "POST", pick(values, ["name", "subtitle", "roles"]), options);
export const deleteProject = (id, options) => send(`/projects/${segment(id)}`, "DELETE", undefined, options);
export const createProjectRecord = (id, values, options) => send(`/projects/${segment(id)}/records`, "POST", pick(values, ["aiOrganize", "memo", "did", "concern", "decision", "result", "nextStep", "attachmentIds", "competencyIds"]), options);
// 잠정 계약: memo를 보낼 수 있다고 가정한다. 백엔드 답변 후 이 경계와 mock을 함께 조정한다.
export const updateProjectRecord = (id, values, options) => send(`/project-records/${segment(id)}`, "PATCH", pick(values, ["memo", "did", "concern", "decision", "result", "nextStep", "isAiOrganized", "attachmentIds", "competencyIds"]), options);
export const deleteProjectRecord = (id, options) => send(`/project-records/${segment(id)}`, "DELETE", undefined, options);
// regenerate는 미확정 전송 필드다. 일반 재진입은 본문 없이 기존 질문·답을 조회한다.
export function getRecordQuestions(id, { regenerate = false, ...options } = {}) {
  return send(`/project-records/${segment(id)}/questions`, "POST", regenerate ? { regenerate: true } : undefined,
    { timeoutMs: AI_TIMEOUT_MS, ...options });
}
export const organizeProjectRecord = (id, options) => send(`/project-records/${segment(id)}/organize`, "POST", undefined, { timeoutMs: AI_TIMEOUT_MS, ...options });
export const saveQuestionAnswer = (id, values, options) => send(`/questions/${segment(id)}`, "PATCH", values, options);
export const getFinishQuestions = (id, recordIds, options) => send(`/projects/${segment(id)}/finish/questions`, "POST", { recordIds }, { timeoutMs: AI_TIMEOUT_MS, ...options });
export const getPortfolioDraft = (id, recordIds, options) => send(`/projects/${segment(id)}/finish/draft`, "POST", { recordIds }, { timeoutMs: AI_TIMEOUT_MS, ...options });
export const savePortfolio = (id, markdown, options) => send(`/projects/${segment(id)}/finish/complete`, "POST", { markdown }, options);
export const getProjectCard = (id, options) => send(`/story-cards/${segment(id)}`, "GET", undefined, options);
export const listProjectCards = ({ request = projectRequest, signal } = {}) => request("/story-cards", { query: { type: "PROJECT" }, signal, timeoutMs: 15000 });
export const updateProjectCard = (id, values, options) => send(`/story-cards/${segment(id)}`, "PATCH", values, options);
export const deleteProjectCard = (id, options) => send(`/story-cards/${segment(id)}`, "DELETE", undefined, options);
export const getAttachment = (id, options) => send(`/attachments/${segment(id)}`, "GET", undefined, options);
export const deleteAttachment = (id, options) => send(`/attachments/${segment(id)}`, "DELETE", undefined, options);
export const createLinkAttachment = (url, category, options) => send("/attachments/links", "POST", { url, category }, options);
export function createFileAttachment(file, category, options) {
  const body = new FormData();
  body.append("file", file);
  body.append("category", category);
  return send("/attachments/files", "POST", body, options);
}
