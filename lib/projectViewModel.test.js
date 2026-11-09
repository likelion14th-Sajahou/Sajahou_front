import assert from "node:assert/strict";
import test from "node:test";
import { attachmentView, recordView, recordBody, cardView, roleCodes } from "./projectViewModel.js";
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
test("API 호출은 UI 필드를 전송하지 않고 일반 질문 조회와 잠정 재생성을 구분한다", async () => {
  const calls = [];
  const request = async (path, options) => { calls.push({path, ...options}); return {}; };
  await createProjectRecord(1, { aiOrganize: false, did: null, problem: "잘못된 이름", isAiOrganized: false, competencyIds: [3] }, { request });
  assert.deepEqual(calls[0].body, { aiOrganize: false, did: null, competencyIds: [3] });
  await updateProjectRecord(7, { memo: "잠정 지원", nextStep: "다음", next: "UI 값" }, { request });
  assert.deepEqual(calls[1].body, { memo: "잠정 지원", nextStep: "다음" });
  await getRecordQuestions(7, { request }); await getRecordQuestions(7, { request, regenerate: true });
  assert.equal(calls[2].body, undefined); assert.deepEqual(calls[3].body, { regenerate: true });
  assert.equal(calls[3].timeoutMs, AI_TIMEOUT_MS); assert.ok(AI_TIMEOUT_MS >= 60000);
});
test("카드 표시 데이터는 서버가 반환한 제목·배운 점과 기록 연결을 유지한다", () => {
  const view = cardView({ cardId: 8, projectId: 1, projectName: "프로젝트", title: "서버 제목", learned: "서버 배운 점", competencies: [], evidenceSummary: [], sourceRecords: [{ recordId: 7 }] });
  assert.equal(view.title, "서버 제목"); assert.equal(view.summary.learned, "서버 배운 점"); assert.equal(view.recordId, "7");
});
