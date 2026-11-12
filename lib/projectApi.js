import { authRequest } from "./auth.js";

export const AI_TIMEOUT_MS = 65000;

// 요청은 공통 authRequest가 보낸다(mock 모드면 lib/mock/server.js, live면 실제 백엔드).
// 화면은 AuthProvider의 authenticatedRequest를 request로 넘겨, 로그인이 만료(401)되면 로그인 상태를 정리한다.
const segment = (id) => encodeURIComponent(id);
const pick = (values, keys) => Object.fromEntries(keys.filter((key) => values[key] !== undefined).map((key) => [key, values[key]]));
function send(path, method, body, { request = authRequest, signal, timeoutMs = 15000 } = {}) {
  return request(path, { method, body, signal, timeoutMs });
}
export const getProjectHome = (options) => send("/home", "GET", undefined, options);
export const getProjectCompetencies = (options) => send("/competencies", "GET", undefined, options);
export const listProjects = (options) => send("/projects", "GET", undefined, options);
export const getProject = (id, options) => send(`/projects/${segment(id)}`, "GET", undefined, options);
export const createProject = (values, options) => send("/projects", "POST", pick(values, ["name", "subtitle", "roles"]), options);
export const deleteProject = (id, options) => send(`/projects/${segment(id)}`, "DELETE", undefined, options);
export const createProjectRecord = (id, values, options) => send(`/projects/${segment(id)}/records`, "POST", pick(values, ["aiOrganize", "did", "concern", "decision", "result", "nextStep", "attachmentIds", "competencyIds"]), options);
// 보낸 필드만 수정한다. 자료 수정도 5칸의 필드로 전달한다.
export const updateProjectRecord = (id, values, options) => send(`/project-records/${segment(id)}`, "PATCH", pick(values, ["did", "concern", "decision", "result", "nextStep", "isAiOrganized", "attachmentIds", "competencyIds"]), options);
export const deleteProjectRecord = (id, options) => send(`/project-records/${segment(id)}`, "DELETE", undefined, options);
// 회고 17번과 동일: AUTO는 일반 진입, CONTINUE는 이전 질문 유지, REGENERATE는 새 질문 생성.
export function getRecordQuestions(id, { mode = "AUTO", ...options } = {}) {
  return send(`/project-records/${segment(id)}/questions`, "POST", { mode },
    { timeoutMs: AI_TIMEOUT_MS, ...options });
}
// 서버에서만 확인된 첨부 처리 지연도 같은 recordId·mode로 제한 재시도한다.
export async function getRecordQuestionsWithRetry(id, { retryDelayMs = 2000, ...options } = {}) {
  for (let attempt = 0; ; attempt += 1) {
    options.signal?.throwIfAborted();
    try {
      return await getRecordQuestions(id, options);
    } catch (error) {
      if (error.status !== 409 || error.code !== "ATTACHMENT_PENDING" || attempt >= 3) throw error;
      await new Promise((resolve, reject) => {
        const signal = options.signal;
        function abort() {
          clearTimeout(timer);
          reject(signal.reason);
        }
        const timer = setTimeout(() => {
          signal?.removeEventListener("abort", abort);
          resolve();
        }, retryDelayMs);
        signal?.addEventListener("abort", abort, { once: true });
        if (signal?.aborted) abort();
      });
    }
  }
}
export const organizeProjectRecord = (id, options) => send(`/project-records/${segment(id)}/organize`, "POST", undefined, { timeoutMs: AI_TIMEOUT_MS, ...options });
export const saveQuestionAnswer = (id, values, options) => send(`/questions/${segment(id)}`, "PATCH", values, options);
export const getFinishQuestions = (id, recordIds, options) => send(`/projects/${segment(id)}/finish/questions`, "POST", { recordIds }, { timeoutMs: AI_TIMEOUT_MS, ...options });
export const getPortfolioDraft = (id, recordIds, options) => send(`/projects/${segment(id)}/finish/draft`, "POST", { recordIds }, { timeoutMs: AI_TIMEOUT_MS, ...options });
export const savePortfolio = (id, markdown, options) => send(`/projects/${segment(id)}/finish/complete`, "POST", { markdown }, options);
export const getProjectCard = (id, options) => send(`/story-cards/${segment(id)}`, "GET", undefined, options);
export const listProjectCards = ({ request = authRequest, signal } = {}) => request("/story-cards", { query: { type: "PROJECT" }, signal, timeoutMs: 15000 });
export const updateProjectCard = (id, values, options) => send(`/story-cards/${segment(id)}`, "PATCH", values, options);
export const deleteProjectCard = (id, options) => send(`/story-cards/${segment(id)}`, "DELETE", undefined, options);
