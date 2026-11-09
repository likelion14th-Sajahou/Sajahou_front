import { readMockSessionUser } from "./auth.js";
import { getMockDemoPart } from "./demoPart.js";
import { failure, success } from "./mockResponse.js";
import { MOCK_WEEK } from "./week.js";

// 회고 API(11~16번) mock이다. API 명세의 요청·응답 형식을 그대로 따르고, 브라우저 localStorage에 저장한다.
// AI 질문·회고록·저장(17~20번)은 아직 없다.
const STORAGE_KEY = "sajarok_mock_retrospectives";

// 주차 설정(C-05)의 mock 값이다. 마감은 파트마다 다르고, 자정은 그날 23:59까지다(R-07).
const CURRENT_WEEK = {
  weekId: MOCK_WEEK.week,
  weekNumber: MOCK_WEEK.week,
  sessionTitle: "역기획 & 리디자인 3",
  deadlinesByPart: {
    PLAN_DESIGN: { session: "2026-11-01", assignment: "2026-11-03" },
    FRONTEND: { session: "2026-11-03", assignment: "2026-11-02" },
    BACKEND: { session: "2026-11-01", assignment: "2026-11-01" },
  },
};

const EMPTY_MATERIALS = {
  hasPractice: null,
  practiceContent: null,
  assignmentMode: null,
  assignmentContent: null,
  codeReview: null,
  memo: null,
};

const isNullableString = (value) => value === null || typeof value === "string";

// PATCH(14번)에서 받을 수 있는 필드와 형식이다. 보낸 필드만 바꾸고, null이면 비운다.
const PATCH_RULES = {
  currentStep: (value) => Number.isInteger(value) && value >= 2 && value <= 4 ? "" : "currentStep은 2~4 사이의 정수여야 해요.",
  hasPractice: (value) => value === null || typeof value === "boolean" ? "" : "hasPractice는 true, false, null 중 하나여야 해요.",
  practiceContent: (value) => isNullableString(value) ? "" : "practiceContent는 문자열이어야 해요.",
  assignmentMode: (value) => value === null || ["RECORD", "LATER", "NONE"].includes(value) ? "" : "assignmentMode는 RECORD, LATER, NONE 중 하나여야 해요.",
  assignmentContent: (value) => isNullableString(value) ? "" : "assignmentContent는 문자열이어야 해요.",
  codeReview: (value) => isNullableString(value) ? "" : "codeReview는 문자열이어야 해요.",
  memo: (value) => isNullableString(value) ? "" : "memo는 문자열이어야 해요.",
  attachmentIds: (value) => Array.isArray(value) && value.every(Number.isInteger) ? "" : "attachmentIds는 숫자 배열이어야 해요.",
};

const atMidnight = (date) => `${date}T23:59:00+09:00`;

// 명세의 날짜·시각 형식(2026-11-08T23:59:00+09:00)으로 바꾼다.
function toKstIso(ms) {
  return `${new Date(ms + 9 * 60 * 60 * 1000).toISOString().slice(0, 19)}+09:00`;
}

function getWeek(part) {
  const deadlines = CURRENT_WEEK.deadlinesByPart[part];
  return {
    weekId: CURRENT_WEEK.weekId,
    weekNumber: CURRENT_WEEK.weekNumber,
    sessionTitle: CURRENT_WEEK.sessionTitle,
    sessionDeadline: atMidnight(deadlines.session),
    assignmentDeadline: atMidnight(deadlines.assignment),
  };
}

function toDetail(retrospective, week) {
  const { id, type, state, currentStep, lastSavedAt, completedAt, materials, attachments, questions, card } = retrospective;
  return {
    id, type, state, isRested: state === "RESTED", currentStep, lastSavedAt, completedAt,
    week: { weekNumber: week.weekNumber, sessionTitle: week.sessionTitle, sessionDeadline: week.sessionDeadline },
    materials, attachments, questions, card,
  };
}

// fetch와 같은 인자를 받아 명세 형식의 Response를 반환한다. 공통 Client가 파싱한다.
export function createMockRetrospectiveFetch({ storage, now = Date.now, getDemoPart = () => null }) {
  function readState() {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const state = JSON.parse(raw);
        if (state?.version === 1 && Array.isArray(state.retrospectives)) return state;
      } catch { /* 손상된 개발용 데이터는 초기 상태로 시작한다. */ }
    }
    return { version: 1, nextId: 101, retrospectives: [] };
  }

  return async function mockFetch(url, init = {}) {
    init.signal?.throwIfAborted();
    const request = new Request(url, init);
    const path = new URL(request.url).pathname.replace(/^\/api\/v1\//, "");
    const method = request.method;
    let body = {};
    if (!["GET", "HEAD"].includes(method)) {
      try {
        const raw = await request.text();
        body = raw ? JSON.parse(raw) : {};
      } catch { return failure(400, "VALIDATION_ERROR", "요청 형식이 올바르지 않습니다."); }
      if (!body || typeof body !== "object" || Array.isArray(body)) return failure(400, "VALIDATION_ERROR", "요청 형식이 올바르지 않습니다.");
    }
    init.signal?.throwIfAborted();
    try {
      const user = readMockSessionUser(storage, now());
      if (!user) return failure(401, "UNAUTHORIZED", "로그인이 만료되었습니다.");

      const state = readState();
      const save = () => storage.setItem(STORAGE_KEY, JSON.stringify(state));
      const week = getWeek(getDemoPart() ?? user.part);
      const mine = state.retrospectives.filter(({ userId }) => userId === user.id);
      const findWeekRetrospective = (type) => mine.find((item) => item.weekId === week.weekId && item.type === type);

      // 11. 이번 주 회고 조회
      if (method === "GET" && path === "retrospectives/current") {
        const session = findWeekRetrospective("SESSION");
        const assignment = findWeekRetrospective("ASSIGNMENT");
        const openAssignments = session?.materials.assignmentMode === "LATER" && assignment?.state !== "COMPLETED"
          ? [{ id: assignment?.id ?? null, weekNumber: week.weekNumber, state: assignment?.state ?? "NOT_STARTED", deadline: week.assignmentDeadline }]
          : [];
        return success({
          week,
          session: session
            ? { id: session.id, state: session.state, currentStep: session.currentStep, assignmentMode: session.materials.assignmentMode, lastSavedAt: session.lastSavedAt }
            : { id: null, state: "NOT_STARTED", currentStep: 1, assignmentMode: null, lastSavedAt: null },
          openAssignments,
        });
      }

      // 12. 회고 시작. 이미 있으면 200과 기존 회고를 돌려준다.
      if (method === "POST" && path === "retrospectives") {
        const { weekId, type, rested = false } = body;
        const fields = {};
        if (!Number.isInteger(weekId)) fields.weekId = "weekId는 숫자여야 해요.";
        if (!["SESSION", "ASSIGNMENT"].includes(type)) fields.type = "type은 SESSION 또는 ASSIGNMENT여야 해요.";
        if (typeof rested !== "boolean") fields.rested = "rested는 true 또는 false여야 해요.";
        else if (rested && type === "ASSIGNMENT") fields.rested = "휴회는 세션 회고에만 있어요.";
        if (Object.keys(fields).length) return failure(400, "VALIDATION_ERROR", "입력값을 확인해 주세요.", fields);
        if (weekId !== week.weekId) return failure(404, "NOT_FOUND", "해당 주차를 찾을 수 없어요.");

        const toStarted = ({ id, weekNumber, state: retrospectiveState, currentStep }) => ({ id, type, weekNumber, state: retrospectiveState, currentStep });
        const existing = findWeekRetrospective(type);
        if (existing) {
          // 시작 전에 휴회했다가 해제한 회고는 이때 작성을 시작한다. (명세에 없는 mock 규칙, 백엔드 확인 필요)
          if (existing.state === "NOT_STARTED" && !rested) {
            Object.assign(existing, { state: "IN_PROGRESS", currentStep: 2 });
            save();
          }
          return success(toStarted(existing));
        }
        if (type === "ASSIGNMENT" && findWeekRetrospective("SESSION")?.materials.assignmentMode !== "LATER") {
          return failure(409, "INVALID_STATE", "과제를 '나중에 쓸게요'로 고른 주에만 과제 회고를 따로 시작할 수 있어요.");
        }
        const retrospective = {
          id: state.nextId, userId: user.id, weekId: week.weekId, weekNumber: week.weekNumber, type,
          // 시작 전에 휴회하면 휴회를 해제했을 때 다시 '시작 전'으로 돌아간다(stateBeforeRest).
          state: rested ? "RESTED" : "IN_PROGRESS", currentStep: rested ? 1 : 2, lastSavedAt: null, completedAt: null,
          ...(rested ? { stateBeforeRest: "NOT_STARTED" } : {}),
          materials: { ...EMPTY_MATERIALS }, attachments: [], questions: [], card: null,
        };
        state.nextId += 1;
        state.retrospectives.push(retrospective);
        save();
        return success(toStarted(retrospective), 201);
      }

      const match = path.match(/^retrospectives\/(\d+)(\/reset|\/rest)?$/);
      const retrospective = match && mine.find(({ id }) => id === Number(match[1]));
      if (match && !retrospective) return failure(404, "NOT_FOUND", "회고를 찾을 수 없어요.");

      // 13. 회고 상세 조회
      if (method === "GET" && match && !match[2]) return success(toDetail(retrospective, week));

      // 14. 회고 임시저장
      if (method === "PATCH" && match && !match[2]) {
        if (retrospective.state !== "IN_PROGRESS") return failure(409, "INVALID_STATE", "작성 중인 회고만 저장할 수 있어요.");
        const fields = {};
        for (const [field, value] of Object.entries(body)) {
          const rule = PATCH_RULES[field];
          const message = rule ? rule(value) : "";
          if (message) fields[field] = message;
        }
        if (Object.hasOwn(body, "assignmentMode") && retrospective.type !== "SESSION") fields.assignmentMode = "과제 작성 방식은 세션 회고에서만 골라요.";
        if (typeof body.codeReview === "string" && (getDemoPart() ?? user.part) !== "FRONTEND") fields.codeReview = "코드리뷰는 프론트엔드 파트만 입력해요.";
        if (Array.isArray(body.attachmentIds) && body.attachmentIds.some((id) => !retrospective.attachments.some(({ attachmentId }) => attachmentId === id))) {
          fields.attachmentIds = "올리지 않은 첨부가 들어 있어요.";
        }
        if (Object.keys(fields).length) return failure(400, "VALIDATION_ERROR", "입력값을 확인해 주세요.", fields);

        for (const field of Object.keys(EMPTY_MATERIALS)) {
          if (Object.hasOwn(body, field)) retrospective.materials[field] = body[field];
        }
        if (Object.hasOwn(body, "currentStep")) retrospective.currentStep = body.currentStep;
        if (Array.isArray(body.attachmentIds)) {
          retrospective.attachments = retrospective.attachments.filter(({ attachmentId }) => body.attachmentIds.includes(attachmentId));
        }
        retrospective.lastSavedAt = toKstIso(now());
        save();
        const { id, state: retrospectiveState, currentStep, lastSavedAt } = retrospective;
        return success({ id, state: retrospectiveState, currentStep, lastSavedAt });
      }

      // 15. 휴회 표시·해제. 해제하면 휴회 전 상태로 돌아가고, 쓰던 내용은 그대로다.
      if (method === "PATCH" && match?.[2] === "/rest") {
        if (typeof body.rested !== "boolean") return failure(400, "VALIDATION_ERROR", "입력값을 확인해 주세요.", { rested: "rested는 true 또는 false여야 해요." });
        if (retrospective.type !== "SESSION") return failure(409, "INVALID_STATE", "휴회는 세션 회고에만 있어요.");
        if (retrospective.state === "COMPLETED") return failure(409, "INVALID_STATE", "완료한 회고는 휴회로 표시할 수 없어요.");
        if (body.rested && retrospective.state !== "RESTED") {
          retrospective.stateBeforeRest = retrospective.state;
          retrospective.state = "RESTED";
        } else if (!body.rested && retrospective.state === "RESTED") {
          retrospective.state = retrospective.stateBeforeRest ?? "IN_PROGRESS";
          delete retrospective.stateBeforeRest;
        }
        save();
        return success({ id: retrospective.id, state: retrospective.state });
      }

      // 16. 회고 처음부터. 2단계 자료, 첨부, AI 질문, 카드 초안을 지운다.
      if (method === "POST" && match?.[2] === "/reset") {
        if (retrospective.state !== "IN_PROGRESS") return failure(409, "INVALID_STATE", "작성 중인 회고만 처음부터 다시 쓸 수 있어요.");
        Object.assign(retrospective, {
          currentStep: 2, lastSavedAt: null, materials: { ...EMPTY_MATERIALS }, attachments: [], questions: [], card: null,
        });
        save();
        return success({ id: retrospective.id, state: retrospective.state, currentStep: retrospective.currentStep });
      }

      return failure(404, "NOT_FOUND", "요청한 기능을 찾을 수 없습니다.");
    } catch {
      return failure(503, "INTERNAL_ERROR", "mock 데이터를 저장할 수 없어요. 브라우저 저장소 사용을 허용해 주세요.");
    }
  };
}

export function mockRetrospectiveFetch(url, init) {
  try {
    return createMockRetrospectiveFetch({ storage: window.localStorage, getDemoPart: getMockDemoPart })(url, init);
  } catch {
    return Promise.resolve(failure(503, "INTERNAL_ERROR", "mock 데이터를 저장할 수 없어요. 브라우저 저장소 사용을 허용해 주세요."));
  }
}
