import { createMockAuthFetch, csrfFailure, hasValidMockCsrf } from "./auth.js";
import { initializeMyRecord } from "./myRecordModel.js";
import { delay, failure, invalid, success, notFound } from "./mockResponse.js";
import { competenciesFor, emptyState, removeRecord } from "./projectModel.js";
import { handleAttachments } from "./handlers/attachments.js";
import { handleHome } from "./handlers/home.js";
import { handleJobPostings } from "./handlers/jobPostings.js";
import { handleProjects } from "./handlers/projects.js";
import { handleQuestions } from "./handlers/questions.js";
import { handleRetrospectives } from "./handlers/retrospectives.js";
import { handleStoryCards } from "./handlers/storyCards.js";
import { migrateCompetencyNames } from "./competencies.js";

// 사용자별 mock 저장소다. 도메인 처리(handlers/)가 같은 데이터를 함께 본다.
// 회고·프로젝트·스토리 카드·첨부·질문·자소서 매칭이 한 저장소에 있어서, 한쪽에서 바꾼 결과를 다른 화면도 그대로 본다.
export const MOCK_STORAGE_PREFIX = "sajarok_mock_v1:";
export const MOCK_SCENARIO_KEY = "sajarok_mock_scenario";
const DAY_MS = 86400000;

// 경로마다 맞는 도메인 처리로 보낸다. 처리하지 않는 경로면 undefined를 돌려주고 다음 도메인으로 넘어간다.
const HANDLERS = [handleHome, handleRetrospectives, handleStoryCards, handleProjects, handleQuestions, handleAttachments, handleJobPostings];

// 공통 준비: 로그인 확인 → 지연·오류 주입 → AI 중복 호출 막기 → 본문 읽기 → 저장소 읽기. 그다음 도메인 처리를 부른다.
// scenario({ path, method, user })는 { delayMs, error, status, extractStatus, finishQuestions }를 돌려준다(테스트·mock 전용).
// finishQuestions: []는 마치기 질문이 필요 없는 정상 응답을 재현한다.
// checkCsrf면 백엔드처럼 GET이 아닌 요청의 CSRF 토큰을 검사한다(브라우저 mock은 켜고, 도메인 테스트는 끈다).
export function createMockServerFetch({ storage, now = Date.now, scenario = () => ({}), getUser, checkCsrf = false } = {}) {
  const authFetch = createMockAuthFetch({ storage, now });
  const currentUser = getUser ?? (async () => {
    const response = await authFetch("https://mock.invalid/api/v1/users/me");
    return response.ok ? (await response.json()).data : null;
  });
  const inFlight = new Set();

  return async function mockFetch(url, init = {}) {
    const path = new URL(url).pathname.replace(/^\/api\/v1/, "");
    const method = (init.method ?? "GET").toUpperCase();
    const signal = init.signal;
    signal?.throwIfAborted();
    // 백엔드처럼 로그인 확인보다 먼저 CSRF를 검사한다.
    if (checkCsrf && method !== "GET" && method !== "HEAD" && !hasValidMockCsrf(storage, init.headers)) return csrfFailure();
    const user = await currentUser();
    if (!user) return failure(401, "UNAUTHORIZED", "로그인이 필요합니다.");
    const key = `${MOCK_STORAGE_PREFIX}${user.id}`;
    // AI를 부르는 요청(🤖): 질문·정리·초안·회고록·자소서 답 만들기, 공고 역량 찾기. 같은 대상의 중복 호출은 409다.
    const ai = method === "POST" && (/\/(questions|organize|draft|review|answer)$/.test(path) || path === "/job-postings");
    const lockKey = `${user.id}:${path.replace(/\/(questions|organize|draft|review|answer)$/, "")}`;
    if (ai && inFlight.has(lockKey)) return failure(409, "AI_IN_PROGRESS", "AI가 처리 중입니다.");
    if (ai) inFlight.add(lockKey);
    try {
      const behavior = scenario({ path, method, user }) ?? {};
      await delay(behavior.delayMs ?? (ai ? 180 : 0), signal);
      if (behavior.error) return failure(behavior.status ?? 502, behavior.error, "Mock 오류 시나리오입니다.");
      // 기다리는 동안 다른 계정으로 바뀌었으면 반영하지 않는다.
      const activeUser = await currentUser();
      if (!activeUser || activeUser.id !== user.id) return failure(401, "UNAUTHORIZED", "로그인이 변경되었습니다.");
      let body = {};
      if (init.body instanceof FormData) body = init.body;
      else if (init.body !== undefined) {
        try { body = JSON.parse(init.body); } catch { return invalid({ body: "JSON 형식을 확인해 주세요." }); }
        if (!body || typeof body !== "object" || Array.isArray(body)) return invalid({ body: "객체가 필요합니다." });
      }
      let state;
      try {
        const raw = storage.getItem(key);
        state = raw ? JSON.parse(raw) : emptyState();
        if (state.version !== 1 || !state.projects || !state.records || !state.cards || !state.questions || !state.attachments || !state.finish) throw new Error("state");
      } catch { return failure(503, "INTERNAL_ERROR", "Mock 저장 데이터를 읽을 수 없습니다."); }
      state.retrospectives ??= {};
      state.jobPostings ??= {};
      state.coverLetterQuestions ??= {};
      initializeMyRecord(state, user.part);
      migrateCompetencyNames(state);
      for (const record of Object.values(state.records)) {
        // 이전 mock 데이터는 기록 태그를 따로 보관하지 않았다. 기존 값을 한 번 복원한다.
        record.competencies ??= (state.cards[record.cardId]?.competencies ?? []).map((item) => ({ ...item }));
        if (record.status === "DRAFT" && now() - record.createdAt >= DAY_MS) removeRecord(state, record.recordId);
      }
      const save = (data, status = 200) => {
        signal?.throwIfAborted();
        storage.setItem(key, JSON.stringify(state));
        return success(data, status);
      };
      const tags = competenciesFor(user.part, Object.values(state.cards));
      const split = path.split("/").filter(Boolean);
      const context = {
        url, path, split, id: Number(split[1]), method, body, user, state, save, now, behavior, tags,
        // 역량 태그는 내 파트·공통 목록에서 1~3개(COMPETENCY_LIMIT).
        findTags: (ids) => {
          if (!Array.isArray(ids) || ids.length < 1 || ids.length > 3 || new Set(ids).size !== ids.length) return null;
          const found = ids.map((tagId) => tags.find((tag) => tag.id === tagId));
          return found.every(Boolean) ? found.map(({ id, name }) => ({ id, name })) : null;
        },
        tagError: () => failure(400, "COMPETENCY_LIMIT", "내 파트·공통 역량을 1~3개 골라 주세요."),
        resolveAttachments: (ids) => Array.isArray(ids) && new Set(ids).size === ids.length && ids.every((attachmentId) => state.attachments[attachmentId]),
        pending: (ids) => ids.some((attachmentId) => state.attachments[attachmentId]?.data.extractStatus === "PENDING"),
        pendingError: () => failure(409, "ATTACHMENT_PENDING", "첨부 자료를 읽고 있습니다."),
      };
      for (const handle of HANDLERS) {
        const response = handle(context);
        if (response) return response;
      }
      return notFound();
    } catch (error) {
      if (signal?.aborted) throw error;
      return failure(503, "INTERNAL_ERROR", "Mock 데이터를 처리할 수 없습니다. 브라우저 저장소를 확인해 주세요.");
    } finally { if (ai) inFlight.delete(lockKey); }
  };
}

let browserFetch;
export function mockServerFetch(url, init) {
  browserFetch ??= createMockServerFetch({ storage: window.localStorage, checkCsrf: true,
    scenario: ({ path }) => {
      const value = window.localStorage.getItem(MOCK_SCENARIO_KEY);
      // localhost 검증용. live에서는 이 모듈 자체를 사용하지 않는다.
      const config = value ? JSON.parse(value) : {};
      return { ...config, ...config.paths?.[path] };
    } });
  return browserFetch(url, init);
}
