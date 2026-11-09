import { readMockSessionUser } from "./auth.js";
import { getMockDemoPart } from "./demoPart.js";
import { failure, success } from "./mockResponse.js";
import { pickQuestions } from "./retrospectiveQuestions.js";
import { MOCK_WEEK } from "./week.js";

// 회고 API(11~18번) mock이다. API 명세의 요청·응답 형식을 그대로 따르고, 브라우저 localStorage에 저장한다.
// 회고록·저장(19~20번)은 아직 없다.
const STORAGE_KEY = "sajarok_mock_retrospectives";
const AI_MODES = ["AUTO", "CONTINUE", "REGENERATE"];
// 같은 회고에 AI 호출이 겹치면 409 AI_IN_PROGRESS다. 브라우저의 여러 요청이 함께 보도록 모듈에 둔다.
const aiInProgress = new Set();

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (!ms) { resolve(); return; }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => { clearTimeout(timer); reject(signal.reason); }, { once: true });
  });
}

// 질문을 만들 때의 자료 상태다. 다시 'AI 질문 받기'를 누를 때 자료가 바뀌었는지 비교한다(R-14).
const materialSnapshot = ({ materials, attachments }) => JSON.stringify({ materials, attachmentIds: attachments.map(({ attachmentId }) => attachmentId) });

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
export function createMockRetrospectiveFetch({ storage, now = Date.now, getDemoPart = () => null, aiDelayMs = 0 }) {
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
      state.nextQuestionId ??= 901;
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

      // 18. 질문 답하기·건너뛰기. 어느 질문이든 다시 보내면 답을 덮어쓴다.
      const questionMatch = path.match(/^questions\/(\d+)$/);
      if (questionMatch) {
        const owner = mine.find(({ questions }) => questions.some(({ questionId }) => questionId === Number(questionMatch[1])));
        if (method !== "PATCH" || !owner) return failure(404, "NOT_FOUND", "질문을 찾을 수 없어요.");
        if (owner.state !== "IN_PROGRESS") return failure(409, "INVALID_STATE", "작성 중인 회고의 질문만 답할 수 있어요.");
        const fields = {};
        if (!["ANSWERED", "SKIPPED"].includes(body.status)) fields.status = "status는 ANSWERED 또는 SKIPPED여야 해요.";
        if (body.status === "ANSWERED" && !(typeof body.answer === "string" && body.answer.trim())) fields.answer = "답을 적거나, 모르겠으면 건너뛰어 주세요.";
        // attachmentIds는 프로젝트 마치기의 '산출물 요청' 질문만 받는다.
        if (Object.hasOwn(body, "attachmentIds")) fields.attachmentIds = "회고 질문에는 첨부를 보낼 수 없어요.";
        if (Object.keys(fields).length) return failure(400, "VALIDATION_ERROR", "입력값을 확인해 주세요.", fields);
        const question = owner.questions.find(({ questionId }) => questionId === Number(questionMatch[1]));
        Object.assign(question, { status: body.status, answer: body.status === "ANSWERED" ? body.answer.trim() : null });
        save();
        const { questionId, seq, status, answer } = question;
        return success({ questionId, seq, status, answer });
      }

      const match = path.match(/^retrospectives\/(\d+)(\/reset|\/rest|\/questions)?$/);
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

      // 17. AI 질문 받기. AUTO: 없으면 만들고 있으면 그대로, CONTINUE: 이전 질문 이어 쓰기, REGENERATE: 질문 새로 만들기.
      if (method === "POST" && match?.[2] === "/questions") {
        const mode = body.mode ?? "AUTO";
        if (!AI_MODES.includes(mode)) return failure(400, "VALIDATION_ERROR", "입력값을 확인해 주세요.", { mode: "mode는 AUTO, CONTINUE, REGENERATE 중 하나여야 해요." });
        if (retrospective.state !== "IN_PROGRESS") return failure(409, "INVALID_STATE", "작성 중인 회고에서만 질문을 받을 수 있어요.");
        if (retrospective.attachments.some(({ extractStatus }) => extractStatus === "PENDING")) return failure(409, "ATTACHMENT_PENDING", "첨부를 아직 읽고 있어요. 잠시 후 다시 시도해 주세요.");
        if (aiInProgress.has(retrospective.id)) return failure(409, "AI_IN_PROGRESS", "질문을 만들고 있어요. 잠시만 기다려 주세요.");

        const snapshot = materialSnapshot(retrospective);
        const hasQuestions = retrospective.questions.length > 0;
        const respond = (status) => {
          retrospective.currentStep = 3;
          retrospective.questionSnapshot = snapshot;
          save();
          return success({ insufficientMaterial: retrospective.questions.length === 0, questions: retrospective.questions }, status);
        };

        if (mode === "CONTINUE") {
          if (!hasQuestions) return failure(409, "INVALID_STATE", "이어 쓸 질문이 없어요.");
          // 고친 자료는 질문에 반영하지 않고, 지금 자료를 기준으로 다시 비교한다.
          return respond(200);
        }
        if (mode === "AUTO" && hasQuestions) {
          if (retrospective.questionSnapshot === snapshot) return respond(200);
          // 답을 쓴 뒤 자료가 바뀌었으면 확인 문구를 띄우게 한다. 아직 답이 없으면 새로 만든다(R-14).
          if (retrospective.questions.some(({ status }) => status !== "PENDING")) {
            const answeredCount = retrospective.questions.filter(({ status }) => status === "ANSWERED").length;
            return Response.json({
              success: false, data: null,
              error: { code: "MATERIAL_CHANGED", message: `자료가 바뀌었어요. 질문을 새로 만들면 지금까지 쓴 답 ${answeredCount}개가 사라져요.`, detail: { answeredCount } },
            }, { status: 409 });
          }
        }

        aiInProgress.add(retrospective.id);
        try {
          await wait(aiDelayMs, init.signal);
        } finally {
          aiInProgress.delete(retrospective.id);
        }
        const picked = pickQuestions({ type: retrospective.type, materials: retrospective.materials, attachments: retrospective.attachments, part: getDemoPart() ?? user.part });
        retrospective.questions = picked.map(({ tag, quote, content }, index) => ({
          questionId: state.nextQuestionId + index, seq: index + 1, tag, quote, sourceAttachmentId: null, content, answer: null, status: "PENDING",
        }));
        state.nextQuestionId += picked.length;
        return respond(201);
      }

      // 16. 회고 처음부터. 2단계 자료, 첨부, AI 질문, 카드 초안을 지운다.
      if (method === "POST" && match?.[2] === "/reset") {
        if (retrospective.state !== "IN_PROGRESS") return failure(409, "INVALID_STATE", "작성 중인 회고만 처음부터 다시 쓸 수 있어요.");
        Object.assign(retrospective, {
          currentStep: 2, lastSavedAt: null, materials: { ...EMPTY_MATERIALS }, attachments: [], questions: [], card: null, questionSnapshot: null,
        });
        save();
        return success({ id: retrospective.id, state: retrospective.state, currentStep: retrospective.currentStep });
      }

      return failure(404, "NOT_FOUND", "요청한 기능을 찾을 수 없습니다.");
    } catch (error) {
      // 요청을 취소했으면 fetch처럼 취소 오류를 그대로 던진다.
      if (init.signal?.aborted) throw error;
      return failure(503, "INTERNAL_ERROR", "mock 데이터를 저장할 수 없어요. 브라우저 저장소 사용을 허용해 주세요.");
    }
  };
}

export function mockRetrospectiveFetch(url, init) {
  try {
    // AI 질문은 실제처럼 잠깐 기다린 뒤 응답한다. 실제 백엔드는 최대 50초까지 걸린다.
    return createMockRetrospectiveFetch({ storage: window.localStorage, getDemoPart: getMockDemoPart, aiDelayMs: 1500 })(url, init);
  } catch {
    return Promise.resolve(failure(503, "INTERNAL_ERROR", "mock 데이터를 저장할 수 없어요. 브라우저 저장소 사용을 허용해 주세요."));
  }
}
