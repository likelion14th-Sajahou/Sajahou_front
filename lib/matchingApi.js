import { authRequest } from "./auth.js";

// 자소서 매칭 API(36~39번) 호출 함수다. NEXT_PUBLIC_AUTH_MODE가 mock이면 브라우저 mock이, live면 실제 백엔드가 응답한다.
// 화면은 AuthProvider의 authenticatedRequest를 request로 넘긴다. 공고 첨부는 attachmentApi.js(7~10번)를 함께 쓴다.
const TIMEOUT_MS = 15000;
// AI 호출은 최대 50초 걸려서 요청 타임아웃을 60초보다 길게 둔다(API 명세 공통).
const AI_TIMEOUT_MS = 65000;
const questionPath = (questionId, suffix = "") => `/cover-letter-questions/${encodeURIComponent(questionId)}${suffix}`;

// 36. 공고 저장·역량 찾기 🤖. 공고 첨부(category JOB_POSTING)는 attachmentIds로, 문항은 1개 이상 보낸다.
// 응답: jobPostingId, competencies(역량·근거 문장·내 카드 수), noCompetencyFound, questions(questionId·문항 역량)
export function createJobPosting(posting, { signal, request = authRequest } = {}) {
  return request("/job-postings", { method: "POST", body: posting, signal, timeoutMs: AI_TIMEOUT_MS });
}

// 37. 문항별 답 초안 만들기 🤖. 다시 부르면 초안을 새로 만들고 직접 고친 답은 비운다.
export function createAnswerDraft(questionId, { signal, request = authRequest } = {}) {
  return request(questionPath(questionId, "/answer"), { method: "POST", signal, timeoutMs: AI_TIMEOUT_MS });
}

// 38. 고친 답 저장. null을 보내면 AI 초안으로 되돌린다.
export function saveEditedAnswer(questionId, editedAnswer, { signal, request = authRequest } = {}) {
  return request(questionPath(questionId), { method: "PATCH", body: { editedAnswer }, signal, timeoutMs: TIMEOUT_MS });
}

// 39. 매칭 결과 조회. 문항마다 answer(37번과 같은 형태, 만들기 전이면 null)와 editedAnswer가 함께 온다.
export function getJobPosting(jobPostingId, { signal, request = authRequest } = {}) {
  return request(`/job-postings/${encodeURIComponent(jobPostingId)}`, { signal, timeoutMs: TIMEOUT_MS });
}
