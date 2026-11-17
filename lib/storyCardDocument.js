// 전문의 첫 제목만 제외한다. 본문의 소제목·목록·줄바꿈은 표시와 복사에서 그대로 유지한다.
export function withoutDocumentTitle(markdown, title) {
  const text = markdown ?? "";
  const first = text.match(/^(?:\uFEFF)?(?:[\t ]*\r?\n)*([^\r\n]*)(?:\r?\n|$)/);
  if (!first) return text;
  const line = first[1].trim();
  const heading = line.match(/^#{1,6}\s+(.+?)(?:\s+#+)?$/);
  const isTitle = /^#\s+/.test(line) || (title?.trim() && (heading?.[1] ?? line) === title.trim());
  return isTitle ? text.slice(first[0].length).replace(/^(?:[\t ]*\r?\n)+/, "") : text;
}
