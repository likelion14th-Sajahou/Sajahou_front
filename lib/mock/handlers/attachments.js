import { failure, invalid } from "../mockResponse.js";
import { CATEGORIES, newId } from "../projectModel.js";

// 7~10. 첨부 올리기·읽기 상태 조회·삭제. 회고·프로젝트·자소서 매칭이 함께 쓴다.
export function handleAttachments({ split, id, method, body, state, save, now, behavior }) {
  if (split[0] !== "attachments") return undefined;
  if (split.length === 2 && method === "POST" && ["links", "files"].includes(split[1])) {
    const category = body instanceof FormData ? body.get("category") : body.category;
    if (!CATEGORIES.includes(category)) return invalid({ category: "첨부 종류를 확인해 주세요." });
    let data;
    if (split[1] === "files") {
      if (!(body instanceof FormData) || body.getAll("file").length !== 1 || body.getAll("category").length !== 1) return invalid({ file: "요청마다 파일 1개와 자료 종류 1개를 보내 주세요." });
      const file = body instanceof FormData && body.get("file");
      if (!(file instanceof Blob)) return invalid({ file: "파일이 필요합니다." });
      if (file.size > 20 * 1024 * 1024) return failure(413, "FILE_TOO_LARGE", "20MB 이하 파일을 올려 주세요.");
      if (!/\.(pdf|png|jpe?g|zip|md|txt)$/i.test(file.name)) return failure(415, "UNSUPPORTED_FILE", "지원하지 않는 파일 형식입니다.");
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
    // 1.5초 뒤 9번 조회에서 읽기 결과(DONE, 시나리오로 FAILED)로 바뀐다.
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
      for (const r of Object.values(state.retrospectives ?? {})) r.attachmentIds = r.attachmentIds.filter((aid) => aid !== id);
      return save(undefined, 204);
    }
  }
  return undefined;
}
