"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import AttachmentChip from "@/components/ui/AttachmentChip";
import Chip from "@/components/ui/Chip";
import FileUploadButton from "@/components/ui/FileUploadButton";
import LinkInputRow from "@/components/ui/LinkInputRow";
import useAttachmentPolling from "@/components/ui/useAttachmentPolling";
import * as api from "@/lib/attachmentApi";
import { attachmentView } from "@/lib/projectViewModel";

// 프로젝트 자료 종류는 먼저 선택한다. 산출물 요청에서는 지정된 category를 사용한다.
const CATEGORY_OPTIONS = [["MEETING_NOTE", "회의록"], ["PRESENTATION", "발표 자료"], ["DESIGN", "디자인"], ["OUTPUT", "산출물"]];
const EXTRACT_LABELS = { PENDING: "읽는 중…", DONE: "본문 읽음", FAILED: "본문 읽지 못함", SKIPPED: "링크만 저장" };
const EXTRACT_HELP = {
  FAILED: "내용을 읽지 못했어요. 링크가 공개인지 확인하거나 PDF·TXT 파일로 올려 주세요.",
  SKIPPED: "피그마 내용은 AI가 읽지 않아요. 참고하게 하려면 PDF로 내보내서 올려 주세요.",
};

export default function RecordAttachmentsField({ label, attachments, category, linkPlaceholder = "피그마·노션·GitHub 링크", onChange, onBusyChange }) {
  const [link, setLink] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
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

  async function run(action) {
    if (mutation.current) return;
    const controller = new AbortController();
    mutation.current = controller; setBusy(true); setError("");
    try { await action(controller.signal); }
    catch (error) { if (!controller.signal.aborted) setError(error.message); }
    finally { mutation.current = null; if (!controller.signal.aborted) setBusy(false); }
  }
  function addFiles(files) {
    if (!files.every(api.isSupportedAttachmentFile)) {
      setError(api.UNSUPPORTED_FILE_MESSAGE); return;
    }
    const fileCategory = category ?? selectedCategory;
    if (!fileCategory) { setError("자료 종류를 먼저 선택해 주세요."); return; }
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
      let url;
      try { url = new URL(link.includes("://") ? link.trim() : `https://${link.trim()}`); } catch { throw new Error("올바른 링크를 입력해 주세요."); }
      if (!["http:", "https:"].includes(url.protocol) || !url.hostname.includes(".")) throw new Error("HTTP(S) 링크를 입력해 주세요.");
      const linkCategory = category ?? selectedCategory;
      if (!linkCategory) throw new Error("자료 종류를 먼저 선택해 주세요.");
      const item = attachmentView(await api.createLinkAttachment(url.href, linkCategory, { signal, request: authenticatedRequest }));
      if (!signal.aborted) { latest.current.onChange([...latest.current.attachments, item]); setLink(""); }
    });
  }
  return (
    <fieldset disabled={busy} className="flex min-w-0 flex-col gap-2" aria-busy={busy}>
      {label && <legend className="text-label text-ink-muted">{label}</legend>}
      {category === undefined && <div role="group" aria-label="새 첨부 자료 종류" className="flex flex-col gap-2">
        <p className="text-label text-ink-muted">자료 종류를 먼저 골라 주세요.</p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_OPTIONS.map(([value, name]) => <Chip key={value} size="sm" selected={selectedCategory === value} onClick={() => setSelectedCategory(value)}>{name}</Chip>)}
        </div>
      </div>}
      <ul aria-label="첨부 자료" className="flex flex-wrap gap-2">
        {attachments.map((a) => <li key={a.id} className="min-w-0 max-w-full">
          <AttachmentChip as="div" kind={a.kind} name={a.name} onRemove={() => run(async (signal) => {
            await api.deleteAttachment(a.attachmentId, { signal, request: authenticatedRequest });
            if (!signal.aborted) latest.current.onChange(latest.current.attachments.filter((item) => item.id !== a.id));
          })} />
          <p role="status" className="text-caption text-ink-muted">
            {CATEGORY_OPTIONS.find(([value]) => value === a.category)?.[1] ?? a.category}
            {EXTRACT_LABELS[a.extractStatus] && ` - ${EXTRACT_LABELS[a.extractStatus]}`}
          </p>
          {EXTRACT_HELP[a.extractStatus] && <p className="max-w-prose text-caption text-ink-muted">{EXTRACT_HELP[a.extractStatus]}</p>}
        </li>)}
      </ul>
      <fieldset disabled={!category && !selectedCategory} className="flex min-w-0 items-center gap-2">
        <FileUploadButton label="+ 파일" ariaLabel="파일 첨부" onSelect={addFiles} />
        <LinkInputRow aria-label="링크" placeholder={linkPlaceholder} value={link} onChange={setLink} onAdd={addLink} />
      </fieldset>
      {busy && <p role="status">첨부 자료를 처리하고 있어요…</p>}
      {shownError && <p role="alert" className="text-label text-tint-red-ink">{shownError} <button type="button" onClick={() => { setError(""); polling.retry(); }}>상태 다시 확인</button></p>}
    </fieldset>
  );
}
