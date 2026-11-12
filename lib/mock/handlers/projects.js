import { failure, invalid, notFound } from "../mockResponse.js";
import {
  RECORD_KEYS, dateOn, newId, text, syncCard, publicRecord, projectRecords, projectSummary, removeRecord, questionsFor, publicQuestion,
} from "../projectModel.js";

const ROLES = ["PM", "PLANNING", "DESIGN", "FRONTEND", "BACKEND"];
const AI_MODES = ["AUTO", "CONTINUE", "REGENERATE"];
const materialSnapshot = (record) => JSON.stringify({ fields: RECORD_KEYS.map((key) => record[key]), attachmentIds: [...record.attachmentIds].sort((a, b) => a - b) });

// 25~34, 43·44. 프로젝트·기록·기록 질문·정리·마치기
export function handleProjects(context) {
  const { path, split, id, method, body, state, save, now } = context;
  if (path === "/projects" && method === "GET") {
    const projects = Object.values(state.projects);
    return save({ inProgressProjects: projects.filter((p) => p.status === "IN_PROGRESS").map((p) => projectSummary(state, p)),
      doneProjects: projects.filter((p) => p.status === "DONE").map((p) => projectSummary(state, p)) });
  }
  if (path === "/projects" && method === "POST") {
    const fields = {};
    if (!text(body.name)) fields.name = "이름을 입력해 주세요.";
    if (!Array.isArray(body.roles) || !body.roles.length || body.roles.some((r) => !ROLES.includes(r))) fields.roles = "역할을 골라 주세요.";
    if (Object.keys(fields).length) return invalid(fields);
    const project = { projectId: newId(state), name: body.name.trim(), subtitle: text(body.subtitle), roles: [...new Set(body.roles)], status: "IN_PROGRESS", startedOn: dateOn(now()), portfolio: null };
    state.projects[project.projectId] = project;
    const { projectId, name, subtitle, roles, status } = project;
    return save({ projectId, name, subtitle, roles, status }, 201);
  }
  if (split[0] === "projects" && state.projects[id]) return handleProject(context);
  if (split[0] === "project-records" && state.records[id]) return handleRecord(context);
  return undefined;
}

function handleProject({ split, id, method, body, state, save, now, findTags, tagError, resolveAttachments, behavior }) {
  const project = state.projects[id];
  if (split.length === 2 && method === "GET") return save({ ...project, ...projectSummary(state, project), records: projectRecords(state, id).map((r) => publicRecord(state, r)) });
  if (split.length === 2 && method === "DELETE") {
    for (const [aid, attachment] of Object.entries(state.attachments)) if (attachment.projectId === id) delete state.attachments[aid];
    for (const q of questionsFor(state, "projectId", id)) {
      for (const aid of q.attachmentIds ?? []) delete state.attachments[aid];
      delete state.questions[q.questionId];
    }
    for (const r of Object.values(state.records).filter((r) => r.projectId === id)) removeRecord(state, r.recordId);
    delete state.finish[id]; delete state.projects[id];
    return save(undefined, 204);
  }
  if (split[2] === "records" && split.length === 3 && method === "POST") {
    if (typeof body.aiOrganize !== "boolean") return invalid({ aiOrganize: "정리 방식을 선택해 주세요." });
    if (!resolveAttachments(body.attachmentIds ?? [])) return invalid({ attachmentIds: "첨부를 확인해 주세요." });
    const record = { recordId: newId(state), projectId: id, cardId: null, date: dateOn(now()), createdAt: now(),
      status: body.aiOrganize ? "DRAFT" : "SAVED", isAiOrganized: false, memo: null,
      ...Object.fromEntries(RECORD_KEYS.map((k) => [k, text(body[k])])), attachmentIds: body.attachmentIds ?? [] };
    const hasContent = record.attachmentIds.length || RECORD_KEYS.some((k) => record[k]);
    if (!hasContent) return failure(400, "EMPTY_MATERIAL", "5칸이나 첨부를 확인해 주세요.");
    if (!body.aiOrganize) {
      const competencies = findTags(body.competencyIds);
      if (!competencies) return tagError();
      syncCard(state, record, competencies);
    }
    state.records[record.recordId] = record;
    return save(publicRecord(state, record), 201);
  }
  if (split[2] === "finish" && split.length === 4 && method === "POST") {
    if (split[3] === "complete") {
      if (!text(body.markdown)) return invalid({ markdown: "포트폴리오 내용을 입력해 주세요." });
      const isFirstCompletion = project.status !== "DONE";
      project.status = "DONE";
      project.portfolio = { markdown: body.markdown, savedAt: new Date(now()).toISOString() };
      for (const q of questionsFor(state, "projectId", id)) delete state.questions[q.questionId];
      delete state.finish[id];
      return save({ projectStatus: "DONE", isFirstCompletion, portfolio: project.portfolio });
    }
    if (!["questions", "draft"].includes(split[3])) return notFound();
    if (!Array.isArray(body.recordIds) || !body.recordIds.length || body.recordIds.some((rid) => state.records[rid]?.projectId !== id || state.records[rid]?.status !== "SAVED")) return invalid({ recordIds: "저장된 기록을 하나 이상 골라 주세요." });
    const records = body.recordIds.map((rid) => state.records[rid]);
    if (split[3] === "questions") {
      const existing = questionsFor(state, "projectId", id);
      if (existing.length || state.finish[id]) return save({ questions: existing.map(publicQuestion) });
      // 빈 질문도 실제 API의 정상 응답이다. AI 판단은 모의하지 않고 QA 시나리오로 재현한다.
      const prompts = behavior.finishQuestions?.length === 0 ? [] : [
        ["role", "내 역할", "맡은 역할을 한 문장으로 보완하면 좋아요", "이 프로젝트에서 맡은 역할은 무엇인가요?"],
        ["result", "최종 결과", "프로젝트의 최종 결과를 확인하고 싶어요", "확인할 수 있는 최종 결과가 있나요?"],
        ["numbers", "근거와 숫자", "성과를 뒷받침하는 근거가 있으면 좋아요", "결과를 뒷받침하는 수치나 반응이 있나요?"],
        ["artifact", "산출물 요청", "최종 산출물이 아직 첨부되지 않았어요", "배포 링크나 발표 자료가 있나요?"],
        ["learned", "배운 점", "기록만으로는 배운 점을 알기 어려워요", "이번 프로젝트에서 배운 점은 무엇인가요?"],
      ];
      const questions = prompts.map(([field, tag, quote, content], index) => ({ questionId: newId(state), projectId: id, field, tag, quote, content, seq: index + 1, status: "PENDING", answer: null }));
      questions.forEach((q) => { state.questions[q.questionId] = q; });
      state.finish[id] = { recordIds: body.recordIds };
      return save({ questions: questions.map(publicQuestion) }, 201);
    }
    const questions = questionsFor(state, "projectId", id);
    const answer = (field) => questions.find((q) => q.field === field && q.status === "ANSWERED")?.answer;
    const artifacts = questions.flatMap((q) => q.attachmentIds ?? []).map((aid) => state.attachments[aid]?.data).filter(Boolean);
    const sections = [["role", "내 역할", answer("role")], ["contribution", "주요 기여", records.map((r) => r.did).filter(Boolean).join("\n")], ["problem", "문제와 해결", records.map((r) => [r.concern, r.decision].filter(Boolean).join("\n")).filter(Boolean).join("\n")], ["result", "결과", [records.map((r) => r.result).filter(Boolean).join("\n"), answer("result"), answer("numbers")].filter(Boolean).join("\n")], ["artifact", "산출물", artifacts.map((a) => a.url || a.name).join("\n")], ["learned", "배운 점", answer("learned")]];
    return save({ markdown: `# ${project.name}\n\n${sections.map(([, label, value]) => `## ${label}\n${value || `(${label}을 더해 주세요)`}`).join("\n\n")}`, blanks: sections.filter(([, , value]) => !value).map(([field]) => field) });
  }
  return undefined;
}

function handleRecord({ split, id, method, body, state, save, findTags, tagError, resolveAttachments, pending, pendingError }) {
  const record = state.records[id];
  if (split.length === 2 && method === "DELETE") { removeRecord(state, id); return save(undefined, 204); }
  if (split.length === 2 && method === "PATCH") {
    if (body.attachmentIds !== undefined && !resolveAttachments(body.attachmentIds)) return invalid({ attachmentIds: "첨부를 확인해 주세요." });
    // 자료 수정만으로 질문을 지우지 않는다. 이후 질문 요청의 mode에 따라 처리한다.
    const next = { ...record, ...Object.fromEntries(RECORD_KEYS.filter((k) => body[k] != null).map((k) => [k, text(body[k])])),
      attachmentIds: body.attachmentIds ?? record.attachmentIds, isAiOrganized: body.isAiOrganized ?? record.isAiOrganized };
    const competencies = body.competencyIds !== undefined ? findTags(body.competencyIds) : record.competencies;
    if (body.competencyIds !== undefined && !competencies) return tagError();
    if (next.status === "SAVED" || body.competencyIds !== undefined) {
      if (!next.attachmentIds.length && !RECORD_KEYS.some((k) => next[k])) return failure(400, "EMPTY_MATERIAL", "5칸이나 첨부가 필요합니다.");
      next.status = "SAVED";
      syncCard(state, next, competencies);
    }
    state.records[id] = next;
    return save(publicRecord(state, next));
  }
  if (split.length === 3 && method === "POST") {
    if (pending(record.attachmentIds)) return pendingError();
    if (split[2] === "questions") {
      const mode = body.mode ?? "AUTO";
      if (!AI_MODES.includes(mode)) return invalid({ mode: "mode는 AUTO, CONTINUE, REGENERATE 중 하나여야 해요." });
      const existing = questionsFor(state, "recordId", id);
      const snapshot = materialSnapshot(record);
      const respond = (status) => {
        record.questionSnapshot = snapshot;
        const questions = questionsFor(state, "recordId", id);
        return save({ insufficientMaterial: questions.length === 0,
          questions: questions.map((q) => ({ ...publicQuestion(q), sourceAttachmentId: q.sourceAttachmentId ?? null, answer: q.answer ?? null })) }, status);
      };
      if (mode === "CONTINUE") {
        if (!existing.length) return failure(409, "INVALID_STATE", "이어 쓸 질문이 없어요.");
        return respond(200);
      }
      if (mode === "AUTO" && existing.length) {
        // 이전 mock 데이터에는 비교 기준이 없으므로 기존 질문을 보존하고 기준을 기록한다.
        if (record.questionSnapshot == null || record.questionSnapshot === snapshot) return respond(200);
        // 회고 17번과 동일하게 답변·건너뛰기 이후에는 사용자가 선택한다.
        if (existing.some((q) => q.status !== "PENDING")) {
          const answeredCount = existing.filter((q) => q.status === "ANSWERED").length;
          return Response.json({ success: false, data: null, error: { code: "MATERIAL_CHANGED",
            message: `자료가 바뀌었어요. 질문을 새로 만들면 지금까지 쓴 답 ${answeredCount}개가 사라져요.`,
            detail: { answeredCount } } }, { status: 409 });
        }
      }
      existing.forEach((q) => { delete state.questions[q.questionId]; });
      const materials = record.attachmentIds.map((aid) => ({ ...state.attachments[aid].data, attachmentId: aid }));
      // 자료 충분성에 대한 AI 판단은 모의하지 않는다. 5칸·첨부가 없는 경우만 재현한다.
      if (!RECORD_KEYS.some((key) => record[key]) && !materials.length) return respond(201);
      const prompts = [];
      const meeting = materials.find((a) => a.category === "MEETING_NOTE" || /\.pdf$/i.test(a.name ?? ""));
      const design = materials.find((a) => a.category === "DESIGN" || a.type === "LINK");
      const sourceId = RECORD_KEYS.some((key) => record[key]) ? null : materials[0]?.attachmentId ?? null;
      if (!materials.length || meeting) prompts.push(["did", "내 역할·과정", "자료와 관련해 직접 한 일은 무엇인가요?", meeting?.attachmentId ?? null]);
      if (design) prompts.push(["decision", "선택의 이유", "그 방법을 선택한 이유는 무엇인가요?", design.attachmentId]);
      prompts.push(["result", "근거와 숫자", "확인한 결과나 받은 반응이 있나요?", sourceId], ["nextStep", "다음", "다음으로 해볼 일은 무엇인가요?", sourceId]);
      const questions = prompts.map(([field, tag, content, sourceAttachmentId], i) => ({ questionId: newId(state), recordId: id, seq: i + 1,
        field, tag, quote: sourceAttachmentId === null ? RECORD_KEYS.map((key) => record[key]).filter(Boolean).join("\n") : null, sourceAttachmentId, content, status: "PENDING", answer: null }));
      questions.forEach((q) => { state.questions[q.questionId] = q; });
      return respond(201);
    }
    if (split[2] === "organize") {
      const fields = Object.fromEntries(RECORD_KEYS.map((k) => [k, record[k]]));
      for (const q of questionsFor(state, "recordId", id)) if (q.status === "ANSWERED") fields[q.field] = q.answer;
      // 모의 AI는 입력한 문장만 복사한다. 파일 본문 추출·실제 AI 생성은 하지 않는다.
      return save({ ...fields, blanks: RECORD_KEYS.filter((k) => !fields[k]) });
    }
  }
  return undefined;
}
