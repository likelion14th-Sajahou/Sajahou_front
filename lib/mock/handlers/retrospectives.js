import { failure, invalid, notFound } from "../mockResponse.js";
import { newId, publicQuestion, questionsFor } from "../projectModel.js";
import { pickQuestions } from "../retrospectiveQuestions.js";
import { MOCK_WEEK } from "../week.js";

// 11~17, 19, 20. 회고 조회·시작·상세·임시저장·휴회·처음부터·AI 질문 받기·회고록과 카드 초안 만들기·저장.
// 답하기(18)는 handlers/questions.js가, 초안 카드 조회·수정(22·23)은 handlers/storyCards.js가 함께 처리한다.

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
  const { id, type, state: retrospectiveState, currentStep, lastSavedAt, completedAt, materials, cardId } = retrospective;
  return {
    id, type, state: retrospectiveState, isRested: retrospectiveState === "RESTED", currentStep, lastSavedAt, completedAt,
    week: { weekNumber: week.weekNumber, sessionTitle: week.sessionTitle, sessionDeadline: week.sessionDeadline },
    materials, attachments: attachmentsOf(state, retrospective), questions: retrospectiveQuestions(state, retrospective).map(publicQuestion),
    // 4단계를 거치면 22번과 같은 카드(초안)다.
    card: (cardId && state.cards[cardId]) ?? null,
  };
}

const firstLine = (value) => value?.split("\n").map((line) => line.trim()).find(Boolean) ?? null;
const bullets = (value) => value.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => `- ${line}`).join("\n");

// 19. 회고록(R-19)과 스토리 카드 초안(R-20)을 자료와 답으로 만든다. 실제로는 AI가 쓰고, mock은 쓴 내용만 옮긴다.
// 자료에 없는 내용은 지어내지 않아 칸을 비우고 blanks에 넣는다.
function buildDraft(state, retrospective, week) {
  const { materials } = retrospective;
  const attachments = attachmentsOf(state, retrospective);
  const answered = retrospectiveQuestions(state, retrospective).filter(({ status }) => status === "ANSWERED");
  const answerOf = (...tags) => answered.filter(({ tag }) => tags.includes(tag)).map(({ answer }) => answer).join("\n") || null;
  const sessionPdf = attachments.find(({ category }) => category === "SESSION_PDF");
  const hasPractice = materials.hasPractice !== false && Boolean(materials.practiceContent?.trim());
  const isAssignmentRecorded = retrospective.type === "ASSIGNMENT" || (materials.assignmentMode ?? "RECORD") === "RECORD";
  const hasAssignment = isAssignmentRecorded && Boolean(materials.assignmentContent?.trim());
  const reflection = answerOf("느낀 점");
  const otherAnswers = answered.filter(({ tag }) => tag !== "느낀 점");

  // 답이 없는 섹션은 넣지 않는다(R-19).
  const sections = [
    `## ${week.weekNumber}주차 ${retrospective.type === "ASSIGNMENT" ? "과제" : "세션"} 회고 · ${week.sessionTitle}`,
    // 과제 회고(R-23)는 과제 블록만 정리하므로 세션 내용 정리를 넣지 않는다.
    retrospective.type === "SESSION" && `### 세션 내용 정리\n${sessionPdf ? `- ${sessionPdf.name}을(를) 읽고 세션 내용을 정리해요. (mock: 실제로는 AI가 PDF 내용을 소제목별로 정리해요)` : "세션 자료 PDF를 올리면 세션 내용을 정리해 드려요"}`,
    hasPractice && `### 실습\n${bullets(materials.practiceContent)}`,
    hasAssignment && `### 과제\n${bullets(materials.assignmentContent)}`,
    retrospective.type === "SESSION" && materials.assignmentMode === "LATER" && "### 과제\n과제 회고에서 따로 정리해요",
    otherAnswers.length > 0 && `### 질문에 답한 내용\n${otherAnswers.map(({ content, answer }) => `- ${content}\n  - ${answer}`).join("\n")}`,
    materials.codeReview?.trim() && `### 코드리뷰·다음 주 다짐\n${bullets(materials.codeReview)}`,
    `### 느낀 점\n${reflection ? bullets(reflection) : "(한 줄 남겨 주세요)"}`,
    materials.memo?.trim() && `### 메모\n${bullets(materials.memo)}`,
  ].filter(Boolean);

  const source = hasAssignment ? materials.assignmentContent : hasPractice ? materials.practiceContent : materials.memo;
  const fields = {
    title: firstLine(source) ?? `${week.weekNumber}주차 회고`,
    situation: firstLine(source),
    action: answerOf("빠진 칸", "역량 신호", "세션과 연결", "선택의 이유", "받은 리뷰"),
    reason: answerOf("선택의 이유", "빠진 칸"),
    result: answerOf("근거와 숫자"),
    learned: reflection,
  };
  const practiceFiles = attachments.filter(({ category }) => category === "PRACTICE").length;
  const assignmentFiles = attachments.filter(({ category, type }) => category === "ASSIGNMENT" && type === "FILE").length;
  const links = attachments.filter(({ type }) => type === "LINK").length;
  const evidenceSummary = [
    sessionPdf && "세션 자료 PDF",
    hasPractice && `실습 메모${practiceFiles ? ` · 첨부 ${practiceFiles}개` : ""}`,
    hasAssignment && `과제 메모${assignmentFiles ? ` · 첨부 ${assignmentFiles}개` : ""}`,
    links > 0 && `링크 ${links}개`,
    answered.length > 0 && `AI 질문 답변 ${answered.length}개`,
  ].filter(Boolean);
  return {
    ...fields,
    blanks: ["situation", "action", "reason", "result", "learned"].filter((key) => !fields[key]),
    fullMarkdown: sections.join("\n\n"),
    evidence: {},
    evidenceSummary,
  };
}

export function handleRetrospectives({ path, split, method, body, user, state, save, now, demoPart, resolveAttachments, pending, pendingError, tagError }) {
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
      materials: { ...EMPTY_MATERIALS }, attachmentIds: [], questionSnapshot: null, cardId: null,
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

  // 19. 회고록·카드 초안 만들기. DRAFT 카드로 저장하고, 답을 고친 뒤 다시 부르면 고친 답으로 다시 만들어 덮어쓴다.
  // 고른 역량 태그는 다시 만들어도 남긴다(R-20 '질문으로 돌아갔다 와도 고른 태그는 유지').
  // AI 대기와 중복 호출(409 AI_IN_PROGRESS)은 공통 진입점이 처리한다.
  if (method === "POST" && action === "review") {
    if (retrospective.state !== "IN_PROGRESS") return failure(409, "INVALID_STATE", "작성 중인 회고에서만 초안을 만들 수 있어요.");
    if (pending(retrospective.attachmentIds)) return pendingError();
    const previous = retrospective.cardId && state.cards[retrospective.cardId];
    const cardId = previous?.cardId ?? newId(state);
    const card = {
      cardId, type: retrospective.type, status: "DRAFT", weekNumber: retrospective.weekNumber, projectId: null, projectName: null,
      ...buildDraft(state, retrospective, week),
      competencies: previous?.competencies ?? [], sourceRecords: null, deletedRecordCount: 0,
    };
    state.cards[cardId] = card;
    retrospective.cardId = cardId;
    retrospective.currentStep = 4;
    const { type, status, title, situation, action, reason, result, learned, blanks, fullMarkdown, evidence } = card;
    return save({ card: {
      cardId, type, status, title, situation, action, reason, result, learned, blanks,
      competencyIds: card.competencies.map(({ id }) => id), fullMarkdown, evidence,
    } });
  }

  // 20. 회고 저장. 회고를 완료하고 초안 카드를 공개해 나의 사자록에 쌓는다. 세션 회고면 이번 주 발자국(스티커)을 채운다.
  // 역량 태그를 1~3개 고르지 않았으면 400 COMPETENCY_LIMIT다.
  if (method === "POST" && action === "complete") {
    if (retrospective.state !== "IN_PROGRESS") return failure(409, "INVALID_STATE", "작성 중인 회고만 저장할 수 있어요.");
    const card = retrospective.cardId && state.cards[retrospective.cardId];
    if (!card) return failure(409, "INVALID_STATE", "회고록과 카드 초안을 먼저 만들어 주세요.");
    if (card.competencies.length < 1 || card.competencies.length > 3) return tagError();
    card.status = "PUBLISHED";
    Object.assign(retrospective, { state: "COMPLETED", completedAt: toKstIso(now()), currentStep: 5 });
    if (retrospective.type === "SESSION") state.completedWeeks = [...new Set([...(state.completedWeeks ?? []), retrospective.weekNumber])];
    const deadline = retrospective.type === "SESSION" ? week.sessionDeadline : week.assignmentDeadline;
    const assignment = findWeekRetrospective(state, "ASSIGNMENT");
    const assignmentPending = retrospective.type === "SESSION" && retrospective.materials.assignmentMode === "LATER" && assignment?.state !== "COMPLETED"
      ? { weekNumber: retrospective.weekNumber, deadline: week.assignmentDeadline } : null;
    return save({ state: "COMPLETED", cardId: card.cardId, weekNumber: retrospective.weekNumber, isLate: now() > Date.parse(deadline), assignmentPending });
  }

  // 16. 회고 처음부터. 2단계 자료, 첨부, AI 질문, 카드 초안을 지운다.
  if (method === "POST" && action === "reset") {
    if (retrospective.state !== "IN_PROGRESS") return failure(409, "INVALID_STATE", "작성 중인 회고만 처음부터 다시 쓸 수 있어요.");
    removeQuestions(state, retrospective);
    for (const attachmentId of retrospective.attachmentIds) delete state.attachments[attachmentId];
    if (retrospective.cardId) delete state.cards[retrospective.cardId];
    Object.assign(retrospective, {
      currentStep: 2, lastSavedAt: null, materials: { ...EMPTY_MATERIALS }, attachmentIds: [], questionSnapshot: null, cardId: null,
    });
    return save({ id: retrospective.id, state: retrospective.state, currentStep: retrospective.currentStep });
  }

  return undefined;
}
