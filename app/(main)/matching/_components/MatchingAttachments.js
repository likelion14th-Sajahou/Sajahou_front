import { useEffect, useEffectEvent, useRef, useState } from "react";
import AttachmentChip, { ChipStatus } from "@/components/ui/AttachmentChip";
import FileUploadButton from "@/components/ui/FileUploadButton";
import LinkInputRow from "@/components/ui/LinkInputRow";
import TextLink from "@/components/ui/TextLink";
import { JOB_POSTING_ACCEPT } from "./useJobPostingAttachments";

// 본문 읽기 상태(API 9)를 칩에 붙인다. 링크·파일 모두 같은 표시다(M-02). 피그마처럼 읽지 않는 첨부(SKIPPED)는 표시하지 않는다.
const READ_STATUS = {
  PENDING: { tone: "neutral", label: "읽는 중" },
  DONE: { tone: "success", label: "본문 읽음" },
  FAILED: { tone: "warning", label: "본문 읽지 못함" },
};

export const UNREADABLE_LINK_MESSAGE = "이 링크는 본문을 못 읽었어요. 공고 내용을 붙여 넣거나 PDF·캡처로 올려 주세요.";

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
    <div className="matching-attachments flex min-w-0 flex-col gap-1.5">
      <p className="text-label text-ink-muted">채용 공고 <span className="text-ink-subtle">· 붙여넣기, PDF·캡처, 링크 중 편한 것</span></p>
      {items.length > 0 && (
        <ul aria-label="첨부 공고" className="flex flex-wrap gap-2">
          {items.map(({ attachmentId, kind, name, extractStatus }) => {
            const status = READ_STATUS[extractStatus];
            return (
              <AttachmentChip
                key={attachmentId}
                kind={kind}
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
      <fieldset disabled={isBusy} aria-busy={isBusy} className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap">
        <FileUploadButton
          label={isBusy ? "올리는 중…" : "+ 공고 파일"}
          ariaLabel="공고 파일"
          accept={JOB_POSTING_ACCEPT}
          onSelect={async (selected) => setError(await attachments.upload(selected))}
        />
        <LinkInputRow
          className="w-full basis-full sm:w-auto sm:basis-auto"
          buttonVariant="ink-outline"
          aria-label="공고 링크"
          placeholder="공고 링크"
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
