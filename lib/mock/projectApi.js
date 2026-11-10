import { createMockAuthFetch } from "./auth.js";
import {
  CATEGORIES, RECORD_KEYS, competenciesFor, dateOn, emptyState, newId, text,
  syncCard, publicRecord, projectRecords, projectSummary, removeRecord, questionsFor, publicQuestion,
} from "./projectModel.js";

export const PROJECT_STORAGE_PREFIX = "sajarok_mock_projects_v1:";
const DAY_MS = 86400000;
const ROLES = ["PM", "PLANNING", "DESIGN", "FRONTEND", "BACKEND"];
const ok = (data, status = 200) => status === 204 ? new Response(null, { status }) : Response.json({ success: true, data, error: null }, { status });
const fail = (status, code, message, fields) => Response.json({ success: false, data: null, error: { code, message, ...(fields ? { fields } : {}) } }, { status });
const invalid = (fields) => fail(400, "VALIDATION_ERROR", "입력값을 확인해 주세요.", fields);
const notFound = () => fail(404, "NOT_FOUND", "대상을 찾을 수 없습니다.");

// 지연·실패를 API body나 사용자 입력에 섞지 않는다. 테스트 또는 mock 전용 설정에서 주입한다.
function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    const cleanup = () => signal?.removeEventListener("abort", abort);
    const timer = setTimeout(() => { cleanup(); resolve(); }, ms);
    function abort() { clearTimeout(timer); cleanup(); reject(signal.reason); }
    signal?.addEventListener("abort", abort, { once: true });
  });
}

export function createMockProjectFetch({ storage, now = Date.now, scenario = () => ({}), getUser } = {}) {
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
    const user = await currentUser();
    if (!user) return fail(401, "UNAUTHORIZED", "로그인이 필요합니다.");
    const key = `${PROJECT_STORAGE_PREFIX}${user.id}`;
    const ai = method === "POST" && /\/(questions|organize|draft)$/.test(path);
    const lockKey = `${user.id}:${path.replace(/\/(questions|organize|draft)$/, "")}`;
    if (ai && inFlight.has(lockKey)) return fail(409, "AI_IN_PROGRESS", "AI가 처리 중입니다.");
    if (ai) inFlight.add(lockKey);
    try {
      const behavior = scenario({ path, method, user }) ?? {};
      await delay(behavior.delayMs ?? (ai ? 180 : 0), signal);
      if (behavior.error) return fail(behavior.status ?? 502, behavior.error, "Mock 오류 시나리오입니다.");
      const activeUser = await currentUser();
      if (!activeUser || activeUser.id !== user.id) return fail(401, "UNAUTHORIZED", "로그인이 변경되었습니다.");
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
      } catch { return fail(503, "INTERNAL_ERROR", "Mock 저장 데이터를 읽을 수 없습니다."); }
      for (const record of Object.values(state.records)) {
        // 이전 mock 데이터는 기록 태그를 따로 보관하지 않았다. 기존 값을 한 번 복원한다.
        record.competencies ??= (state.cards[record.cardId]?.competencies ?? []).map((item) => ({ ...item }));
        if (record.status === "DRAFT" && now() - record.createdAt >= DAY_MS) removeRecord(state, record.recordId);
      }
      const save = (data, status = 200) => {
        signal?.throwIfAborted();
        storage.setItem(key, JSON.stringify(state));
        return ok(data, status);
      };
      const tags = competenciesFor(user.part, Object.values(state.cards));
      const findTags = (ids) => {
        if (!Array.isArray(ids) || ids.length < 1 || ids.length > 3 || new Set(ids).size !== ids.length) return null;
        const found = ids.map((id) => tags.find((tag) => tag.id === id));
        return found.every(Boolean) ? found.map(({ id, name }) => ({ id, name })) : null;
      };
      const tagError = () => fail(400, "COMPETENCY_LIMIT", "내 파트·공통 역량을 1~3개 골라 주세요.");
      const resolveAttachments = (ids) => Array.isArray(ids) && new Set(ids).size === ids.length && ids.every((id) => state.attachments[id]);
      const pending = (ids) => ids.some((id) => state.attachments[id]?.data.extractStatus === "PENDING");
      const pendingError = () => fail(409, "ATTACHMENT_PENDING", "첨부 자료를 읽고 있습니다.");
      const split = path.split("/").filter(Boolean);
      const id = Number(split[1]);

      if (path === "/competencies" && method === "GET") return save(tags);
      if (path === "/story-cards" && method === "GET") {
        const query = new URL(url).searchParams;
        const cards = Object.values(state.cards).reverse().filter((card) =>
          (!query.get("type") || query.get("type") === "PROJECT") &&
          (!query.get("competencyId") || card.competencies.some((c) => String(c.id) === query.get("competencyId"))) &&
          (!query.get("q") || `${card.title} ${card.competencies.map((c) => c.name).join(" ")} ${card.evidenceSummary.join(" ")}`.toLowerCase().includes(query.get("q").toLowerCase())));
        return save({ totalCount: cards.length, cards: cards.map(({ cardId, type, weekNumber, projectId, projectName, title, competencies, evidenceSummary }) => ({ cardId, type, weekNumber, projectId, projectName, title, competencies, evidenceSummary })) });
      }
      if (path === "/projects" && method === "GET") {
        const projects = Object.values(state.projects);
        return save({ inProgressProjects: projects.filter((p) => p.status === "IN_PROGRESS").map((p) => projectSummary(state, p)),
          doneProjects: projects.filter((p) => p.status === "DONE").map((p) => projectSummary(state, p)) });
      }
      if (path === "/home" && method === "GET") {
        const projects = Object.values(state.projects);
        return save({ user: { name: user.name, part: user.part },
          currentWeek: { weekId: 10, weekNumber: 10, phase: "IDEATHON", sessionTitle: "아이디어톤 준비", sessionDeadline: "2026-11-08T23:59:00+09:00", assignmentDeadline: "2026-11-10T23:59:00+09:00" },
          sessionRetrospective: { id: null, state: "NOT_STARTED" },
          stickers: { totalCount: 0, recentWeekNumbers: [], projectStickers: [], showThisWeekSlot: true },
          inProgressProjects: projects.filter((p) => p.status === "IN_PROGRESS").map((p) => { const s = projectSummary(state, p); return { id: s.projectId, name: s.name, recordCount: s.recordCount, lastRecordDate: s.lastRecordDate }; }),
          doneProjects: projects.filter((p) => p.status === "DONE").map((p) => ({ id: p.projectId, name: p.name, cardCount: projectRecords(state, p.projectId).length, recordCount: projectRecords(state, p.projectId).length })), recentCards: [] });
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
      if (split[0] === "projects" && state.projects[id]) {
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
            status: body.aiOrganize ? "DRAFT" : "SAVED", isAiOrganized: false, memo: text(body.memo),
            ...Object.fromEntries(RECORD_KEYS.map((k) => [k, text(body[k])])), attachmentIds: body.attachmentIds ?? [] };
          const hasContent = record.attachmentIds.length || (body.aiOrganize ? record.memo : RECORD_KEYS.some((k) => record[k]));
          if (!hasContent) return fail(400, "EMPTY_MATERIAL", "메모·5칸 또는 첨부를 확인해 주세요.");
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
            if (existing.length) return save({ questions: existing.map(publicQuestion) });
            const prompts = [["role", "내 역할", "이 프로젝트에서 맡은 역할은 무엇인가요?"], ["result", "최종 결과", "확인할 수 있는 최종 결과가 있나요?"], ["numbers", "근거와 숫자", "결과를 뒷받침하는 수치나 반응이 있나요?"], ["artifact", "산출물 요청", "배포 링크나 발표 자료가 있나요?"], ["learned", "배운 점", "이번 프로젝트에서 배운 점은 무엇인가요?"]];
            const questions = prompts.map(([field, tag, content], index) => ({ questionId: newId(state), projectId: id, field, tag, content, seq: index + 1, status: "PENDING", answer: null }));
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
      }
      if (split[0] === "project-records" && state.records[id]) {
        const record = state.records[id];
        if (split.length === 2 && method === "DELETE") { removeRecord(state, id); return save(undefined, 204); }
        if (split.length === 2 && method === "PATCH") {
          if (body.attachmentIds !== undefined && !resolveAttachments(body.attachmentIds)) return invalid({ attachmentIds: "첨부를 확인해 주세요." });
          // 잠정 계약: memo 수정 허용. 질문은 명시적으로 재생성하기 전까지 유지한다.
          const next = { ...record, ...Object.fromEntries(["memo", ...RECORD_KEYS].filter((k) => body[k] != null).map((k) => [k, text(body[k])])),
            attachmentIds: body.attachmentIds ?? record.attachmentIds, isAiOrganized: body.isAiOrganized ?? record.isAiOrganized };
          const competencies = body.competencyIds !== undefined ? findTags(body.competencyIds) : record.competencies;
          if (body.competencyIds !== undefined && !competencies) return tagError();
          if (next.status === "SAVED" || body.competencyIds !== undefined) {
            if (!next.attachmentIds.length && !RECORD_KEYS.some((k) => next[k])) return fail(400, "EMPTY_MATERIAL", "5칸이나 첨부가 필요합니다.");
            next.status = "SAVED";
            syncCard(state, next, competencies);
          }
          state.records[id] = next;
          return save(publicRecord(state, next));
        }
        if (split.length === 3 && method === "POST") {
          if (pending(record.attachmentIds)) return pendingError();
          if (split[2] === "questions") {
            const existing = questionsFor(state, "recordId", id);
            if (existing.length && !body.regenerate) return save({ questions: existing.map(publicQuestion) });
            // regenerate:true는 백엔드 확인 전 mock에서만 보장되는 잠정 계약이다.
            existing.forEach((q) => { delete state.questions[q.questionId]; });
            const materials = record.attachmentIds.map((aid) => state.attachments[aid].data);
            const prompts = [];
            if (!materials.length || materials.some((a) => a.category === "MEETING_NOTE" || /\.pdf$/i.test(a.name ?? ""))) prompts.push(["did", "내 역할·과정", "자료와 관련해 직접 한 일은 무엇인가요?"]);
            if (materials.some((a) => a.category === "DESIGN" || a.type === "LINK")) prompts.push(["decision", "선택의 이유", "그 방법을 선택한 이유는 무엇인가요?"]);
            prompts.push(["result", "근거와 숫자", "확인한 결과나 받은 반응이 있나요?"], ["nextStep", "다음", "다음으로 해볼 일은 무엇인가요?"]);
            const questions = prompts.map(([field, tag, content], i) => ({ questionId: newId(state), recordId: id, seq: i + 1, field, tag, quote: record.memo ?? "첨부 자료", content, status: "PENDING", answer: null }));
            questions.forEach((q) => { state.questions[q.questionId] = q; });
            return save({ questions: questions.map(publicQuestion) }, 201);
          }
          if (split[2] === "organize") {
            const fields = Object.fromEntries(RECORD_KEYS.map((k) => [k, record[k]]));
            for (const q of questionsFor(state, "recordId", id)) if (q.status === "ANSWERED") fields[q.field] = q.answer;
            // 모의 AI는 입력한 문장만 복사한다. 파일 본문 추출·실제 AI 생성은 하지 않는다.
            return save({ ...fields, blanks: RECORD_KEYS.filter((k) => !fields[k]) });
          }
        }
      }
      if (split[0] === "questions" && split.length === 2 && method === "PATCH") {
        const question = state.questions[id];
        if (!question) return notFound();
        const artifact = question.field === "artifact";
        if (!["ANSWERED", "SKIPPED"].includes(body.status)) return invalid({ status: "상태를 선택해 주세요." });
        if (body.status === "ANSWERED" && !(artifact ? body.attachmentIds?.length : text(body.answer))) return invalid({ answer: "답변이나 산출물을 입력해 주세요." });
        if (body.attachmentIds !== undefined && (!artifact || !resolveAttachments(body.attachmentIds))) return invalid({ attachmentIds: "산출물 질문의 첨부를 확인해 주세요." });
        if (artifact && pending(body.attachmentIds ?? [])) return pendingError();
        question.status = body.status; question.answer = body.status === "SKIPPED" ? null : text(body.answer);
        if (artifact) {
          question.attachmentIds = body.status === "SKIPPED" ? [] : body.attachmentIds;
          for (const aid of question.attachmentIds) state.attachments[aid].projectId = question.projectId;
        }
        return save({ questionId: id, seq: question.seq, status: question.status, answer: question.answer });
      }
      if (split[0] === "story-cards" && split.length === 2) {
        const card = state.cards[id];
        if (!card) return notFound();
        if (method === "GET") return save(card);
        if (method === "DELETE") { removeRecord(state, card.sourceRecords[0].recordId); return save(undefined, 204); }
        if (method === "PATCH") {
          if (body.competencyIds !== undefined) { const competencies = findTags(body.competencyIds); if (!competencies) return tagError(); card.competencies = competencies; }
          for (const k of ["title", "situation", "action", "reason", "result", "learned", "fullMarkdown"]) if (Object.hasOwn(body, k)) card[k] = text(body[k]);
          card.blanks = ["situation", "action", "reason", "result", "learned"].filter((k) => !card[k]);
          return save(card);
        }
      }
      if (split[0] === "attachments") {
        if (split.length === 2 && method === "POST" && ["links", "files"].includes(split[1])) {
          const category = body instanceof FormData ? body.get("category") : body.category;
          if (!CATEGORIES.includes(category)) return invalid({ category: "첨부 종류를 확인해 주세요." });
          let data;
          if (split[1] === "files") {
            if (!(body instanceof FormData) || body.getAll("file").length !== 1 || body.getAll("category").length !== 1) return invalid({ file: "요청마다 파일 1개와 자료 종류 1개를 보내 주세요." });
            const file = body instanceof FormData && body.get("file");
            if (!(file instanceof Blob)) return invalid({ file: "파일이 필요합니다." });
            if (file.size > 20 * 1024 * 1024) return fail(413, "FILE_TOO_LARGE", "20MB 이하 파일을 올려 주세요.");
            if (!/\.(pdf|png|jpe?g|zip|md|txt)$/i.test(file.name)) return fail(415, "UNSUPPORTED_FILE", "지원하지 않는 파일 형식입니다.");
            data = { type: "FILE", name: file.name, contentType: file.type || "application/octet-stream", sizeBytes: file.size };
          } else {
            let link;
            try { link = new URL(body.url); } catch { return invalid({ url: "전체 URL을 입력해 주세요." }); }
            if (!["http:", "https:"].includes(link.protocol)) return invalid({ url: "HTTP(S) 링크만 가능합니다." });
            const host = link.hostname.toLowerCase();
            const linkType = (domain) => host === domain || host.endsWith(`.${domain}`);
            data = { type: "LINK", url: link.href, linkType: linkType("figma.com") ? "FIGMA" : linkType("github.com") ? "GITHUB" : linkType("notion.so") || linkType("notion.site") ? "NOTION" : "OTHER" };
          }
          data = { attachmentId: newId(state), ...data, category, extractStatus: data.linkType === "FIGMA" ? "SKIPPED" : "PENDING" };
          state.attachments[data.attachmentId] = { data, readyAt: now() + 1500, outcome: behavior.extractStatus ?? "DONE" };
          return save(data, 201);
        }
        const item = state.attachments[id];
        if (split.length === 2 && item) {
          if (method === "GET") {
            if (item.data.extractStatus === "PENDING" && now() >= item.readyAt) item.data.extractStatus = item.outcome;
            return save(item.data);
          }
          if (method === "DELETE") {
            delete state.attachments[id];
            for (const record of Object.values(state.records)) record.attachmentIds = record.attachmentIds.filter((aid) => aid !== id);
            for (const q of Object.values(state.questions)) if (q.attachmentIds) q.attachmentIds = q.attachmentIds.filter((aid) => aid !== id);
            return save(undefined, 204);
          }
        }
      }
      return notFound();
    } catch (error) {
      if (signal?.aborted) throw error;
      return fail(503, "INTERNAL_ERROR", "Mock 데이터를 처리할 수 없습니다. 브라우저 저장소를 확인해 주세요.");
    } finally { if (ai) inFlight.delete(lockKey); }
  };
}

let browserFetch;
export function mockProjectFetch(url, init) {
  browserFetch ??= createMockProjectFetch({ storage: window.localStorage,
    scenario: () => {
      const value = window.localStorage.getItem("sajarok_mock_project_scenario");
      // localhost 검증용. live에서는 이 모듈 자체를 사용하지 않는다.
      return value ? JSON.parse(value) : {};
    } });
  return browserFetch(url, init);
}
