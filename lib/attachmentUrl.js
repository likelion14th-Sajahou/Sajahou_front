export const INVALID_ATTACHMENT_URL_MESSAGE = "올바른 http 또는 https 링크를 입력해 주세요.";
export const GITHUB_ONLY_MESSAGE = "프로젝트에는 GitHub 링크만 등록할 수 있어요.";

export function normalizeGithubAttachmentUrl(value) {
  const normalized = normalizeAttachmentUrl(value);
  if (!normalized) return null;
  const url = new URL(normalized);
  return ["github.com", "www.github.com"].includes(url.hostname) && !url.port ? normalized : null;
}

// 화면에서는 프로토콜을 생략할 수 있지만, 첨부 API에는 완전한 HTTP(S) URL을 보낸다.
export function normalizeAttachmentUrl(value) {
  const input = value.trim();
  if (!input) return null;

  // example.com:8080처럼 포트가 붙은 주소는 프로토콜이 생략된 주소다.
  const hasPort = /^[^/?#:\s]+:\d+(?:[/?#]|$)/.test(input);
  const hasProtocol = /^[a-z][a-z\d+.-]*:/i.test(input) && !hasPort;
  const candidate = input.startsWith("//") ? `https:${input}` : hasProtocol ? input : `https://${input}`;

  try {
    const url = new URL(candidate);
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname.includes(".") || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}
