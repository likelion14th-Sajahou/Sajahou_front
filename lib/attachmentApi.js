import { authRequest } from "./auth.js";

// 첨부 API(7~10번) 호출 함수다. 회고·프로젝트 기록·자소서 매칭이 함께 쓴다.
// 화면은 AuthProvider의 authenticatedRequest를 request로 넘긴다.
const TIMEOUT_MS = 15000;
const path = (attachmentId) => `/attachments/${encodeURIComponent(attachmentId)}`;

// 7번이 받는 파일(API 명세): PDF, PNG, JPG, ZIP(노션 Markdown 내보내기), MD, TXT · 20MB까지
export const ATTACHMENT_MAX_BYTES = 20 * 1024 * 1024;
const SUPPORTED_FILE = /\.(pdf|png|jpe?g|zip|md|txt)$/i;
export const UNSUPPORTED_FILE_MESSAGE = "PDF·PNG·JPG·ZIP·MD·TXT 파일을 20MB 이하로 올려 주세요.";

export function isSupportedAttachmentFile(file) {
  return file.size <= ATTACHMENT_MAX_BYTES && SUPPORTED_FILE.test(file.name);
}

// 7. 파일 올리기. 올린 직후 extractStatus는 PENDING이고, 9번으로 1.5초마다 확인한다.
export function createFileAttachment(file, category, { signal, request = authRequest } = {}) {
  const body = new FormData();
  body.append("file", file);
  body.append("category", category);
  return request("/attachments/files", { method: "POST", body, signal, timeoutMs: TIMEOUT_MS });
}

// 8. 링크 올리기. http, https만 받는다. 피그마는 본문을 읽지 않아 바로 SKIPPED다.
export function createLinkAttachment(url, category, { signal, request = authRequest } = {}) {
  return request("/attachments/links", { method: "POST", body: { url, category }, signal, timeoutMs: TIMEOUT_MS });
}

// 9. 첨부 읽기 상태 조회: PENDING(읽는 중) | DONE(본문 읽음) | FAILED(읽지 못함) | SKIPPED(읽지 않음)
export function getAttachment(attachmentId, { signal, request = authRequest } = {}) {
  return request(path(attachmentId), { signal, timeoutMs: TIMEOUT_MS });
}

// 10. 첨부 삭제. 성공하면 204(본문 없음)라 undefined를 돌려준다.
export function deleteAttachment(attachmentId, { signal, request = authRequest } = {}) {
  return request(path(attachmentId), { method: "DELETE", signal, timeoutMs: TIMEOUT_MS });
}
