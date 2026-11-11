import assert from "node:assert/strict";
import test from "node:test";
import { attachmentView, recordView, recordBody, recordQuestionState, cardView, roleCodes } from "./projectViewModel.js";
import { createProjectRecord, updateProjectRecord, getRecordQuestions, AI_TIMEOUT_MS } from "./projectApi.js";

test("화면 표시용 이름을 API 필드·ID로 되돌리고 빈 한 일을 제목으로 채워 넣지 않는다", () => {
  const input = { recordId: 7, cardId: 8, date: "2026-11-10", did: null, memo: "메모 첫 줄", concern: "문제", decision: "이유", result: null, nextStep: "다음",
    isAiOrganized: true, competencies: [{ id: 3, name: "협업" }], attachments: [{ attachmentId: 9, type: "LINK", url: "https://example.com/?a=1#x" }] };
  const view = recordView(input);
  assert.equal(view.weekday, "화"); assert.equal(view.problem, "문제"); assert.equal(view.cardId, "8");
  assert.deepEqual(recordBody(view, [{ id: 3, name: "협업" }]), { did: null, concern: "문제", decision: "이유", result: null, nextStep: "다음", attachmentIds: [9], competencyIds: [3], isAiOrganized: true });
  assert.equal(attachmentView(input.attachments[0]).name, "https://example.com/?a=1#x");
  assert.deepEqual(roleCodes(["기획", "프론트엔드"]), ["PLANNING", "FRONTEND"]);
});
test("API 호출은 UI 필드를 전송하지 않고 질문 모드와 요청 옵션을 전달한다", async () => {
  const calls = [];
  const request = async (path, options) => { calls.push({path, ...options}); return {}; };
  await createProjectRecord(1, { aiOrganize: false, did: null, problem: "잘못된 이름", isAiOrganized: false, competencyIds: [3] }, { request });
  assert.deepEqual(calls[0].body, { aiOrganize: false, did: null, competencyIds: [3] });
  await updateProjectRecord(7, { memo: "수정 메모", nextStep: "다음", next: "UI 값" }, { request });
  assert.deepEqual(calls[1].body, { memo: "수정 메모", nextStep: "다음" });
  const controller = new AbortController();
  await getRecordQuestions(7, { request });
  await getRecordQuestions(7, { request, mode: "CONTINUE", signal: controller.signal });
  await getRecordQuestions(7, { request, mode: "REGENERATE", timeoutMs: 70000 });
  assert.deepEqual(calls.slice(2).map((call) => call.body), [{ mode: "AUTO" }, { mode: "CONTINUE" }, { mode: "REGENERATE" }]);
  for (const call of calls.slice(2)) {
    assert.equal(call.path, "/project-records/7/questions"); assert.equal(call.method, "POST");
  }
  assert.equal(calls[3].signal, controller.signal);
  assert.equal(calls[3].timeoutMs, AI_TIMEOUT_MS); assert.ok(AI_TIMEOUT_MS >= 60000);
  assert.equal(calls[4].timeoutMs, 70000);
});
test("카드 표시 데이터는 서버가 반환한 제목·배운 점과 기록 연결을 유지한다", () => {
  const view = cardView({ cardId: 8, projectId: 1, projectName: "프로젝트", title: "서버 제목", learned: "서버 배운 점", competencies: [], evidenceSummary: [], sourceRecords: [{ recordId: 7 }] });
  assert.equal(view.title, "서버 제목"); assert.equal(view.summary.learned, "서버 배운 점"); assert.equal(view.recordId, "7");
});

test("질문 재진입은 같은 답의 미저장 입력·진행·원본 출처를 유지하고 서버에서 바뀐 답은 복원한다", () => {
  const questions = [{ questionId: 1, answer: "저장된 답", status: "ANSWERED" }, { questionId: 2, answer: null, status: "PENDING" }];
  const current = { questions, inputs: { 1: "수정 중인 답", 2: "미저장 답", 99: "이전 질문" }, index: 1,
    sourceAttachments: [{ attachmentId: 5, name: "원본.pdf" }] };
  const next = recordQuestionState(current, questions, [{ attachmentId: 6, name: "새 자료.pdf" }]);
  assert.deepEqual(next.inputs, { 1: "수정 중인 답", 2: "미저장 답" });
  assert.equal(next.index, 1); assert.deepEqual(next.sourceAttachments, current.sourceAttachments);
  const updated = recordQuestionState(current, [{ ...questions[0], answer: "서버에서 수정한 답" }, questions[1]], []);
  assert.deepEqual(updated.inputs, { 2: "미저장 답" });
  assert.equal(updated.questions[0].answer, "서버에서 수정한 답");
});

test("AUTO의 새 질문과 REGENERATE 성공은 이전 답·진행·출처를 새 질문 기준으로 바꾼다", () => {
  const questions = [{ questionId: 1, answer: "답", status: "ANSWERED" }, { questionId: 2, answer: null, status: "PENDING" }];
  const current = { questions, inputs: { 1: "이전 입력" }, index: 1, sourceAttachments: [{ attachmentId: 5 }] };
  const attachments = [{ attachmentId: 6 }];
  const fresh = [{ questionId: 3, answer: null, status: "PENDING" }];
  assert.deepEqual(recordQuestionState(current, fresh, attachments), { questions: fresh, inputs: {}, index: 0, sourceAttachments: attachments });
  assert.deepEqual(recordQuestionState(current, questions, attachments, { regenerate: true }), { questions, inputs: {}, index: 0, sourceAttachments: attachments });
  assert.deepEqual(recordQuestionState(current, [], []), { questions: [], inputs: {}, index: 0, sourceAttachments: [] });
  assert.deepEqual(current.inputs, { 1: "이전 입력" });
});

test("세션 카드의 주차별 기존 스티커와 삭제된 근거 안내를 재사용한다", () => {
  const card = cardView({ cardId: 301, type: "SESSION", weekNumber: 9, competencies: [], evidenceSummary: ["근거"], deletedRecordCount: 2 });
  assert.equal(card.shape, "square"); assert.equal(card.color, "yellow");
  assert.equal(card.evidence, "근거 · 삭제된 기록 2개");
  assert.equal(card.whenLabel, "9주차");
});

test("기록 수정은 비운 5칸을 빈 문자열로 전송하고 생성 요청은 null을 유지한다", async () => {
  const input = { did: "", problem: "", choice: "", result: "", next: "", attachments: [], tags: [] };
  const keys = ["did", "concern", "decision", "result", "nextStep"];
  const createBody = recordBody(input, []);
  const patchBody = recordBody(input, [], { isUpdate: true });
  for (const key of keys) {
    assert.equal(createBody[key], null);
    assert.equal(patchBody[key], "");
  }
  const populated = recordBody({ ...input, did: "유지할 한 일", problem: "유지할 고민" }, [], { isUpdate: true });
  assert.equal(populated.did, "유지할 한 일");
  assert.equal(populated.concern, "유지할 고민");
  const calls = [];
  await updateProjectRecord(7, { ...patchBody, memo: "" }, {
    request: async (path, options) => { calls.push({ path, ...options }); return {}; },
  });
  assert.equal(calls[0].path, "/project-records/7");
  assert.equal(calls[0].method, "PATCH");
  for (const key of [...keys, "memo"]) assert.equal(calls[0].body[key], "");
});
