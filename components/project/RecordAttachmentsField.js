"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import AttachmentChip, { ChipStatus } from "@/components/ui/AttachmentChip";
import BlankFieldsNotice from "@/components/ui/BlankFieldsNotice";
import Chip from "@/components/ui/Chip";
import FileDropZone from "@/components/ui/FileDropZone";
import LinkPasteField from "@/components/ui/LinkPasteField";
import useAttachmentPolling from "@/components/ui/useAttachmentPolling";
import * as api from "@/lib/attachmentApi";
import { attachmentView } from "@/lib/projectViewModel";
import { normalizeGithubAttachmentUrl, GITHUB_ONLY_MESSAGE } from "@/lib/attachmentUrl";
import { ATTACHMENT_CATEGORIES, attachmentCategoryName } from "./recordFields";

// 프로젝트 자료 종류는 먼저 선택한다. 산출물 요청에서는 지정된 category를 사용한다.
// 읽기 상태(API 9)를 칩 안의 작은 표시로 보여 준다(11/13 디자인). 읽지 못한 칩은 주황 바탕이다.
const EXTRACT_STATUS = {
  PENDING: { label: "읽는 중…", tone: "neutral" },
  DONE: { label: "본문 읽음", tone: "success" },
  FAILED: { label: "본문 읽지 못함", tone: "warning" },
  SKIPPED: { label: "링크만 저장", tone: "neutral" },
};
const categoryName = (value) => attachmentCategoryName(value) ?? value;

// label: 맨 위 제목줄(선택). 프로젝트에서 새로 등록하는 링크는 GitHub만 허용한다.
export default function RecordAttachmentsField({ label, attachments, category, onChange, onBusyChange }) {
  const [link, setLink] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [needsCategory, setNeedsCategory] = useState(false);
  const categoryGroupRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const latest = useRef({ attachments, onChange, onBusyChange });
  const mutation = useRef(null);
  const { authenticatedRequest } = useAuth();
  useEffect(() => { latest.current = { attachments, onChange, onBusyChange }; });
  useEffect(() => () => mutation.current?.abort(), []);
  useEffect(() => { onBusyChange?.(busy); }, [busy, onBusyChange]);

  // 읽는 중인 첨부의 상태를 확인해 칩에 반영한다(공통 훅).
  const polling = useAttachmentPolling(attachments, (results) => {
    latest.current.onChange(latest.current.attachments.map((a) => {
      const item = results.find((r) => r.attachmentId === a.attachmentId);
      return item ? attachmentView({ ...a, ...item }) : a;
    }));
  }, { request: authenticatedRequest });
  const shownError = error || polling.error;

  // 공용 업로드 UI는 그대로 두고, 이 화면에서 선택 전의 파일 선택·드롭을 가로챈다.
  function requireCategory(event) {
    if (category ?? selectedCategory) return;
    event.preventDefault();
    if (event.type !== "drop") event.stopPropagation();
    setNeedsCategory(true);
    setError("자료 종류를 먼저 선택해 주세요.");
    const chips = categoryGroupRef.current?.querySelectorAll("button");
    chips?.[0]?.focus();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    chips?.forEach((chip, index) => {
      chip.getAnimations().forEach((animation) => animation.cancel());
      const direction = index % 2 === 0 ? 1 : -1;
      const scale = index === 2 ? 1.2 : 1;
      chip.animate([0, -4, 3.5, -2.5, 1.5, 0].map((angle) => ({
        transform: `rotate(${angle * direction * scale}deg)`,
      })), { duration: 420, easing: "ease-in-out" });
    });
  }

  async function run(action) {
    if (mutation.current) return;
    const controller = new AbortController();
    mutation.current = controller; setBusy(true); setError("");
    try { await action(controller.signal); }
    catch (error) { if (!controller.signal.aborted) setError(error.message); }
    finally { mutation.current = null; if (!controller.signal.aborted) setBusy(false); }
  }
  function addFiles(files) {
    const fileCategory = category ?? selectedCategory;
    if (!fileCategory) { setError("자료 종류를 먼저 선택해 주세요."); return; }
    if (!files.every(api.isSupportedAttachmentFile)) {
      setError(api.UNSUPPORTED_FILE_MESSAGE); return;
    }
    run(async (signal) => {
      for (const file of files) {
        const item = attachmentView(await api.createFileAttachment(file, fileCategory, { signal, request: authenticatedRequest }));
        signal.throwIfAborted();
        const next = [...latest.current.attachments, item];
        latest.current.attachments = next;
        latest.current.onChange(next);
      }
    });
  }
  function addLink() {
    run(async (signal) => {
      const url = normalizeGithubAttachmentUrl(link);
      if (!url) throw new Error(GITHUB_ONLY_MESSAGE);
      const linkCategory = category ?? selectedCategory;
      if (!linkCategory) throw new Error("자료 종류를 먼저 선택해 주세요.");
      const item = attachmentView(await api.createLinkAttachment(url, linkCategory, { signal, request: authenticatedRequest }));
      if (!signal.aborted) { latest.current.onChange([...latest.current.attachments, item]); setLink(""); }
    });
  }
  const activeCategory = category ?? selectedCategory;
  const skipped = attachments.some((a) => a.extractStatus === "SKIPPED");
  const failed = attachments.filter((a) => a.extractStatus === "FAILED");

  return (
    <fieldset disabled={busy} className="flex min-w-0 flex-col gap-2.5" aria-busy={busy}>
      {label && <legend className="mb-2.5">{label}</legend>}
      {category === undefined && (
        // 자료 종류(11/13 디자인): 2px 테두리 칩, 고르면 진하게. 칩은 버튼이라 삼립호빵체다.
        <div ref={categoryGroupRef} role="group" aria-label="새 첨부 자료 종류" className="flex flex-wrap gap-1.5">
          {ATTACHMENT_CATEGORIES.map(([value, name]) => (
            <Chip key={value} size="sm" className={`border-2! px-3.5! font-display ${needsCategory ? "border-yellow-400! outline outline-yellow-400" : ""}`} selected={selectedCategory === value} onClick={() => { setSelectedCategory(value); setNeedsCategory(false); setError(""); }}>{name}</Chip>
          ))}
        </div>
      )}
      {attachments.length > 0 && (
        <ul aria-label="첨부 자료" className="flex flex-wrap gap-2">
          {attachments.map((a) => (
            <AttachmentChip
              key={a.id}
              kind={a.kind}
              name={a.name}
              showKind={false}
              prefix={categoryName(a.category)}
              status={EXTRACT_STATUS[a.extractStatus] && <ChipStatus tone={EXTRACT_STATUS[a.extractStatus].tone}>{EXTRACT_STATUS[a.extractStatus].label}</ChipStatus>}
              warning={a.extractStatus === "FAILED"}
              onRemove={() => run(async (signal) => {
                await api.deleteAttachment(a.attachmentId, { signal, request: authenticatedRequest });
                if (!signal.aborted) latest.current.onChange(latest.current.attachments.filter((item) => item.id !== a.id));
              })}
            />
          ))}
        </ul>
      )}
      {/* 읽지 못했거나 링크만 저장한 자료는 칩 아래에 이유를 알려 준다(13-e). */}
      {skipped && <BlankFieldsNotice>피그마 내용은 AI가 읽지 않아요. 참고하게 하려면 PDF로 내보내서 올려 주세요.</BlankFieldsNotice>}
      {failed.map((a) => (
        <BlankFieldsNotice key={a.id} tone="bad"><span><b>{a.name}</b> 내용을 읽지 못했어요. 링크가 공개인지 확인하거나 PDF·TXT 파일로 올려 주세요.</span></BlankFieldsNotice>
      ))}
      {/* 자료 종류를 고르기 전에는 올릴 수 없다. */}
      <div className="flex min-w-0 flex-wrap items-stretch gap-2">
        <div
          onClickCapture={requireCategory}
          onKeyDownCapture={(event) => { if (event.key === "Enter" || event.key === " ") requireCategory(event); }}
          onDropCapture={requireCategory}
        >
          <FileDropZone size="sm" label="파일 올리기" accept=".pdf,.zip,.md,.txt,.png,.jpg,.jpeg" onSelect={addFiles} disabled={busy} />
        </div>
        <fieldset disabled={!activeCategory} className="min-w-0 flex-1 basis-[240px]">
          <LinkPasteField aria-label="GitHub 링크" placeholder="GitHub 링크 붙여넣기" value={link} onChange={setLink} onAdd={addLink} />
        </fieldset>
      </div>
      <p className="text-label text-ink-subtle">링크는 GitHub만 등록할 수 있어요. 다른 자료는 파일로 올려 주세요.</p>
      {busy && <p role="status">첨부 자료를 처리하고 있어요…</p>}
      {shownError && <p role="alert" className="text-label text-tint-red-ink">{shownError} {!needsCategory && <button type="button" onClick={() => { setError(""); polling.retry(); }}>상태 다시 확인</button>}</p>}
    </fieldset>
  );
}
