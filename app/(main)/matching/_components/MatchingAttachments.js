import { useEffect, useEffectEvent, useRef, useState } from "react";
import AttachmentChip, { ChipStatus } from "@/components/ui/AttachmentChip";
import FileDropZone from "@/components/ui/FileDropZone";
import LinkPasteField from "@/components/ui/LinkPasteField";
import TextLink from "@/components/ui/TextLink";
import { JOB_POSTING_ACCEPT } from "./useJobPostingAttachments";

// Figma처럼 성공·SKIPPED는 이름만, 읽는 중·실패는 상태 배지를 함께 표시한다(M-02).
const READ_STATUS = {
  PENDING: { tone: "neutral", label: "읽는 중" },
  FAILED: { tone: "warning", label: "본문 읽지 못함" },
};

export const UNREADABLE_LINK_MESSAGE = "이 링크는 본문을 못 읽었어요. 로그인이 필요하거나 접근이 막힌 사이트예요. 공고 내용을 위에 붙여 넣거나 PDF·캡처로 올려 주세요.";

// 입력한 링크를 전체 URL로 바꾼다. 'www.…'처럼 주소만 넣으면 https://를 붙인다. 올바르지 않으면 null이다.
function toLinkUrl(value) {
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`);
    if (!["https:", "http:"].includes(url.protocol) || !url.hostname.includes(".") || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

// 채용 공고 첨부(M-02): PDF·캡처 파일과 공고 링크. attachments는 useJobPostingAttachments의 반환값이다.
// 11/15 디자인: JD 칸 아래에 첨부 칩 → 못 읽은 링크 안내 → 넓은 파일 올리기 칸 → 링크 칸 순서다(회고 자료와 같은 공용 칸).
export default function MatchingAttachments({ attachments, onLinkUnreadable }) {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const { items, isBusy } = attachments;
  const hasUnreadableLink = items.some(({ type, extractStatus }) => type === "LINK" && extractStatus === "FAILED");
  const failedLinks = items.filter(({ type, extractStatus }) => type === "LINK" && extractStatus === "FAILED").map(({ attachmentId }) => attachmentId).join(",");
  const previousFailedLinks = useRef(new Set());
  const notifyUnreadable = useEffectEvent(() => onLinkUnreadable?.());
  // 안내가 렌더링된 뒤 이동한다. 즉시 실패·폴링·복원 모두 포함하고 같은 실패로 반복 이동하지 않는다.
  useEffect(() => {
    const current = new Set(failedLinks ? failedLinks.split(",") : []);
    if ([...current].some((id) => !previousFailedLinks.current.has(id))) notifyUnreadable();
    previousFailedLinks.current = current;
  }, [failedLinks]);

  async function addLink() {
    const url = toLinkUrl(link.trim());
    if (!url) {
      setError("올바른 http 또는 https 공고 링크를 입력해 주세요.");
      return;
    }
    const message = await attachments.addLink(url);
    setError(message);
    if (!message) setLink("");
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {items.length > 0 && (
        <ul aria-label="첨부 공고" className="flex flex-wrap gap-2">
          {items.map(({ attachmentId, kind, name, extractStatus }) => {
            const status = READ_STATUS[extractStatus];
            return (
              <AttachmentChip
                key={attachmentId}
                kind={kind}
                showKind={false}
                name={kind === "link" ? name.replace(/^https?:\/\//, "") : name}
                warning={extractStatus === "FAILED"}
                status={status && <ChipStatus tone={status.tone}>{status.label}</ChipStatus>}
                onRemove={isBusy ? undefined : async () => setError(await attachments.remove(attachmentId))}
              />
            );
          })}
        </ul>
      )}
      {hasUnreadableLink && (
        <p role="status" className="flex items-start gap-2 rounded-xl bg-tint-yellow px-3 py-2.5 text-label text-tint-yellow-ink">
          <span aria-hidden="true">⚑</span>
          <span>{UNREADABLE_LINK_MESSAGE}</span>
        </p>
      )}
      <fieldset disabled={isBusy} aria-busy={isBusy} className="flex min-w-0 flex-col gap-[22px]">
        <FileDropZone
          label={isBusy ? "올리는 중…" : "공고 파일 올리기"}
          accept={JOB_POSTING_ACCEPT}
          disabled={isBusy}
          onSelect={async (selected) => setError(await attachments.upload(selected))}
        />
        <LinkPasteField
          aria-label="공고 링크"
          placeholder="공고 링크 붙여넣기"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "matching-attachment-error" : undefined}
          value={link}
          onChange={(value) => { setLink(value); setError(""); }}
          onAdd={addLink}
        />
      </fieldset>
      {/* 파일 형식·링크·업로드 오류를 회고·프로젝트처럼 칸 아래 빨간 글자로 보여 준다. */}
      {error && (
        <p id="matching-attachment-error" role="alert" className="text-label text-tint-red-ink">
          {error}
        </p>
      )}
      {attachments.pollingError && (
        <p role="alert" className="text-label text-tint-red-ink">
          {attachments.pollingError} <TextLink size="sm" onClick={attachments.retryPolling}>상태 다시 확인</TextLink>
        </p>
      )}
    </div>
  );
}
