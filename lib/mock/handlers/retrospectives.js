import { failure, invalid, notFound } from "../mockResponse.js";
import { newId, publicQuestion, questionsFor } from "../projectModel.js";
import { pickQuestions } from "../retrospectiveQuestions.js";
import { MOCK_WEEK } from "../week.js";

// 11~17. 회고 조회·시작·상세·임시저장·휴회·처음부터·AI 질문 받기. 답하기(18)는 handlers/questions.js가 함께 처리한다.
// 회고록·저장(19·20)은 아직 없다.

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

const AI_MODES = ["AUTO", "CONTINUE", "REGENERATE"];
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

// 이번 주 정보. 홈(4번)도 같은 값을 쓴다.
export function getCurrentWeek(part) {
  const deadlines = CURRENT_WEEK.deadlinesByPart[part];
  return {
    weekId: CURRENT_WEEK.weekId,
    weekNumber: CURRENT_WEEK.weekNumber,
    sessionTitle: CURRENT_WEEK.sessionTitle,
    sessionDeadline: atMidnight(deadlines.session),
    assignmentDeadline: atMidnight(deadlines.assignment),
  };
}

// 이번 주 회고(type: SESSION | ASSIGNMENT). 홈(4번)도 세션 회고 상태를 여기서 읽는다.
export function findWeekRetrospective(state, type) {
  return Object.values(state.retrospectives ?? {}).find((item) => item.weekId === CURRENT_WEEK.weekId && item.type === type);
}

const attachmentsOf = (state, retrospective) => retrospective.attachmentIds.map((id) => state.attachments[id]?.data).filter(Boolean);
const retrospectiveQuestions = (state, retrospective) => questionsFor(state, "retrospectiveId", retrospective.id);

// 질문을 만들 때의 자료 상태다. 다시 'AI 질문 받기'를 누를 때 자료가 바뀌었는지 비교한다(R-14).
const materialSnapshot = ({ materials, attachmentIds }) => JSON.stringify({ materials, attachmentIds });

function removeQuestions(state, retrospective) {
  for (const question of retrospectiveQuestions(state, retrospective)) delete state.questions[question.questionId];
}

function toDetail(state, retrospective, week) {
  const { id, type, state: retrospectiveState, currentStep, lastSavedAt, completedAt, materials, card } = retrospective;
  return {
    id, type, state: retrospectiveState, isRested: retrospectiveState === "RESTED", currentStep, lastSavedAt, completedAt,
    week: { weekNumber: week.weekNumber, sessionTitle: week.sessionTitle, sessionDeadline: week.sessionDeadline },
    materials, attachments: attachmentsOf(state, retrospective), questions: retrospectiveQuestions(state, retrospective).map(publicQuestion), card,
  };
}

export function handleRetrospectives({ path, split, method, body, user, state, save, now, demoPart, resolveAttachments, pending, pendingError }) {
  if (split[0] !== "retrospectives") return undefined;
  state.retrospectives ??= {};
  // '데모 · 파트 바꿔 보기'로 고른 파트가 있으면 그 파트의 마감·질문 세트를 쓴다(mock 전용).
  const part = demoPart ?? user.part;
  const week = getCurrentWeek(part);

  // 11. 이번 주 회고 조회
  if (method === "GET" && path === "/retrospectives/current") {
    const session = findWeekRetrospective(state, "SESSION");
    const assignment = findWeekRetrospective(state, "ASSIGNMENT");
    const openAssignments = session?.materials.assignmentMode === "LATER" && assignment?.state !== "COMPLETED"
      ? [{ id: assignment?.id ?? null, weekNumber: week.weekNumber, state: assignment?.state ?? "NOT_STARTED", deadline: week.assignmentDeadline }]
      : [];
    return save({
      week,
      session: session
        ? { id: session.id, state: session.state, currentStep: session.currentStep, assignmentMode: session.materials.assignmentMode, lastSavedAt: session.lastSavedAt }
        : { id: null, state: "NOT_STARTED", currentStep: 1, assignmentMode: null, lastSavedAt: null },
      openAssignments,
    });
  }

  // 12. 회고 시작. 이미 있으면 200과 기존 회고를 돌려준다.
  if (method === "POST" && path === "/retrospectives") {
    const { weekId, type, rested = false } = body;
    const fields = {};
    if (!Number.isInteger(weekId)) fields.weekId = "weekId는 숫자여야 해요.";
    if (!["SESSION", "ASSIGNMENT"].includes(type)) fields.type = "type은 SESSION 또는 ASSIGNMENT여야 해요.";
    if (typeof rested !== "boolean") fields.rested = "rested는 true 또는 false여야 해요.";
    else if (rested && type === "ASSIGNMENT") fields.rested = "휴회는 세션 회고에만 있어요.";
    if (Object.keys(fields).length) return invalid(fields);
    if (weekId !== week.weekId) return failure(404, "NOT_FOUND", "해당 주차를 찾을 수 없어요.");

    const toStarted = ({ id, weekNumber, state: retrospectiveState, currentStep }) => ({ id, type, weekNumber, state: retrospectiveState, currentStep });
    const existing = findWeekRetrospective(state, type);
    if (existing) {
      // 시작 전에 휴회했다가 해제한 회고는 이때 작성을 시작한다. (명세에 없는 mock 규칙, 백엔드 확인 필요)
      if (existing.state === "NOT_STARTED" && !rested) Object.assign(existing, { state: "IN_PROGRESS", currentStep: 2 });
      return save(toStarted(existing));
    }
    if (type === "ASSIGNMENT" && findWeekRetrospective(state, "SESSION")?.materials.assignmentMode !== "LATER") {
      return failure(409, "INVALID_STATE", "과제를 '나중에 쓸게요'로 고른 주에만 과제 회고를 따로 시작할 수 있어요.");
    }
    const retrospective = {
      id: newId(state), weekId: week.weekId, weekNumber: week.weekNumber, type,
      // 시작 전에 휴회하면 휴회를 해제했을 때 다시 '시작 전'으로 돌아간다(stateBeforeRest).
      state: rested ? "RESTED" : "IN_PROGRESS", currentStep: rested ? 1 : 2, lastSavedAt: null, completedAt: null,
      ...(rested ? { stateBeforeRest: "NOT_STARTED" } : {}),
      materials: { ...EMPTY_MATERIALS }, attachmentIds: [], questionSnapshot: null, card: null,
    };
    state.retrospectives[retrospective.id] = retrospective;
    return save(toStarted(retrospective), 201);
  }

  if (split.length > 3) return undefined;
  const retrospective = state.retrospectives[Number(split[1])];
  if (!retrospective) return notFound();
  const action = split[2];

  // 13. 회고 상세 조회
  if (method === "GET" && !action) return save(toDetail(state, retrospective, week));

  // 14. 회고 임시저장
  if (method === "PATCH" && !action) {
    if (retrospective.state !== "IN_PROGRESS") return failure(409, "INVALID_STATE", "작성 중인 회고만 저장할 수 있어요.");
    const fields = {};
    for (const [field, value] of Object.entries(body)) {
      const message = PATCH_RULES[field]?.(value) ?? "";
      if (message) fields[field] = message;
    }
    if (Object.hasOwn(body, "assignmentMode") && retrospective.type !== "SESSION") fields.assignmentMode = "과제 작성 방식은 세션 회고에서만 골라요.";
    if (typeof body.codeReview === "string" && part !== "FRONTEND") fields.codeReview = "코드리뷰는 프론트엔드 파트만 입력해요.";
    if (Array.isArray(body.attachmentIds) && !fields.attachmentIds && !resolveAttachments(body.attachmentIds)) fields.attachmentIds = "올리지 않은 첨부가 들어 있어요.";
    if (Object.keys(fields).length) return invalid(fields);

    for (const field of Object.keys(EMPTY_MATERIALS)) {
      if (Object.hasOwn(body, field)) retrospective.materials[field] = body[field];
    }
    if (Object.hasOwn(body, "currentStep")) retrospective.currentStep = body.currentStep;
    if (Array.isArray(body.attachmentIds)) retrospective.attachmentIds = body.attachmentIds;
    retrospective.lastSavedAt = toKstIso(now());
    const { id, state: retrospectiveState, currentStep, lastSavedAt } = retrospective;
    return save({ id, state: retrospectiveState, currentStep, lastSavedAt });
  }

  // 15. 휴회 표시·해제. 해제하면 휴회 전 상태로 돌아가고, 쓰던 내용은 그대로다.
  if (method === "PATCH" && action === "rest") {
    if (typeof body.rested !== "boolean") return invalid({ rested: "rested는 true 또는 false여야 해요." });
    if (retrospective.type !== "SESSION") return failure(409, "INVALID_STATE", "휴회는 세션 회고에만 있어요.");
    if (retrospective.state === "COMPLETED") return failure(409, "INVALID_STATE", "완료한 회고는 휴회로 표시할 수 없어요.");
    if (body.rested && retrospective.state !== "RESTED") {
      retrospective.stateBeforeRest = retrospective.state;
      retrospective.state = "RESTED";
    } else if (!body.rested && retrospective.state === "RESTED") {
      retrospective.state = retrospective.stateBeforeRest ?? "IN_PROGRESS";
      delete retrospective.stateBeforeRest;
    }
    return save({ id: retrospective.id, state: retrospective.state });
  }

  // 17. AI 질문 받기. AUTO: 없으면 만들고 있으면 그대로, CONTINUE: 이전 질문 이어 쓰기, REGENERATE: 질문 새로 만들기.
  // AI 대기와 같은 회고의 중복 호출(409 AI_IN_PROGRESS)은 공통 진입점이 처리한다.
  if (method === "POST" && action === "questions") {
    const mode = body.mode ?? "AUTO";
    if (!AI_MODES.includes(mode)) return invalid({ mode: "mode는 AUTO, CONTINUE, REGENERATE 중 하나여야 해요." });
    if (retrospective.state !== "IN_PROGRESS") return failure(409, "INVALID_STATE", "작성 중인 회고에서만 질문을 받을 수 있어요.");
    if (pending(retrospective.attachmentIds)) return pendingError();

    const snapshot = materialSnapshot(retrospective);
    const existing = retrospectiveQuestions(state, retrospective);
    const respond = (status) => {
      retrospective.currentStep = 3;
      retrospective.questionSnapshot = snapshot;
      const questions = retrospectiveQuestions(state, retrospective);
      return save({ insufficientMaterial: questions.length === 0, questions: questions.map(publicQuestion) }, status);
    };

    if (mode === "CONTINUE") {
      if (!existing.length) return failure(409, "INVALID_STATE", "이어 쓸 질문이 없어요.");
      // 고친 자료는 질문에 반영하지 않고, 지금 자료를 기준으로 다시 비교한다.
      return respond(200);
    }
    if (mode === "AUTO" && existing.length) {
      if (retrospective.questionSnapshot === snapshot) return respond(200);
      // 답을 쓴 뒤 자료가 바뀌었으면 확인 문구를 띄우게 한다. 아직 답이 없으면 새로 만든다(R-14).
      if (existing.some(({ status }) => status !== "PENDING")) {
        const answeredCount = existing.filter(({ status }) => status === "ANSWERED").length;
        return Response.json({
          success: false, data: null,
          error: { code: "MATERIAL_CHANGED", message: `자료가 바뀌었어요. 질문을 새로 만들면 지금까지 쓴 답 ${answeredCount}개가 사라져요.`, detail: { answeredCount } },
        }, { status: 409 });
      }
    }

    removeQuestions(state, retrospective);
    const picked = pickQuestions({ type: retrospective.type, materials: retrospective.materials, attachments: attachmentsOf(state, retrospective), part });
    picked.forEach(({ tag, quote, content }, index) => {
      const questionId = newId(state);
      state.questions[questionId] = {
        questionId, retrospectiveId: retrospective.id, seq: index + 1, tag, quote, sourceAttachmentId: null, content, answer: null, status: "PENDING",
      };
    });
    return respond(201);
  }

  // 16. 회고 처음부터. 2단계 자료, 첨부, AI 질문, 카드 초안을 지운다.
  if (method === "POST" && action === "reset") {
    if (retrospective.state !== "IN_PROGRESS") return failure(409, "INVALID_STATE", "작성 중인 회고만 처음부터 다시 쓸 수 있어요.");
    removeQuestions(state, retrospective);
    for (const attachmentId of retrospective.attachmentIds) delete state.attachments[attachmentId];
    Object.assign(retrospective, {
      currentStep: 2, lastSavedAt: null, materials: { ...EMPTY_MATERIALS }, attachmentIds: [], questionSnapshot: null, card: null,
    });
    return save({ id: retrospective.id, state: retrospective.state, currentStep: retrospective.currentStep });
  }

  return undefined;
}
