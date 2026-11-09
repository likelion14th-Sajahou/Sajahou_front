"use client";

import { useEffect, useRef, useState } from "react";
import AttachmentChip from "@/components/ui/AttachmentChip";
import FileUploadButton from "@/components/ui/FileUploadButton";
import LinkInputRow from "@/components/ui/LinkInputRow";
import * as api from "@/lib/projectApi";
import { attachmentView } from "@/lib/projectViewModel";

// PM 확인 전 임시 UI. category가 지정된 산출물 요청에서는 지정값을 사용한다.
const CATEGORY_OPTIONS = [["MEETING_NOTE", "회의록"], ["PRESENTATION", "발표 자료"], ["DESIGN", "디자인"], ["OUTPUT", "산출물"]];
const EXTRACT_LABELS = { PENDING: "읽는 중", DONE: "본문 읽음", FAILED: "본문 읽지 못함", SKIPPED: "본문 읽지 않음" };

export default function RecordAttachmentsField({ label, attachments, category, linkPlaceholder = "피그마·노션·GitHub 링크", onChange, onBusyChange }) {
  const [link, setLink] = useState("");
  const [linkCategory, setLinkCategory] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const latest = useRef({ attachments, onChange, onBusyChange });
  const mutation = useRef(null);
  useEffect(() => { latest.current = { attachments, onChange, onBusyChange }; });
  useEffect(() => () => mutation.current?.abort(), []);
  useEffect(() => { onBusyChange?.(busy || pendingFiles.length > 0); }, [busy, pendingFiles.length, onBusyChange]);

  useEffect(() => {
    const pending = attachments.filter((a) => a.extractStatus === "PENDING");
    if (!pending.length) return;
    const controller = new AbortController();
    let timer;
    let attempts = 0;
    async function poll() {
      try {
        const results = await Promise.all(pending.map((a) => api.getAttachment(a.attachmentId, { signal: controller.signal })));
        if (controller.signal.aborted) return;
        if (results.some((item) => item.extractStatus !== "PENDING")) {
          latest.current.onChange(latest.current.attachments.map((a) => {
            const item = results.find((r) => r.attachmentId === a.attachmentId);
            return item ? attachmentView({ ...a, ...item }) : a;
          }));
        } else if (++attempts < 80) timer = setTimeout(poll, 1500);
        else setError("첨부 상태 확인이 오래 걸리고 있어요. 다시 확인해 주세요.");
      } catch (error) { if (!controller.signal.aborted) setError(error.message); }
    }
    timer = setTimeout(poll, 1500);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [attachments, retry]);

  async function run(action) {
    if (mutation.current) return;
    const controller = new AbortController();
    mutation.current = controller; setBusy(true); setError("");
    try { await action(controller.signal); }
    catch (error) { if (!controller.signal.aborted) setError(error.message); }
    finally { mutation.current = null; if (!controller.signal.aborted) setBusy(false); }
  }
  function addFiles(files) {
    if (files.some((file) => file.size > 20 * 1024 * 1024 || !/\.(pdf|png|jpe?g|zip|md|txt)$/i.test(file.name))) {
      setError("PDF·PNG·JPG·ZIP·MD·TXT 파일을 20MB 이하로 올려 주세요."); return;
    }
    setError("");
    setPendingFiles((current) => [...current, ...files.map((file) => ({ id: crypto.randomUUID(), file, category: category ?? "" }))]);
  }
  function uploadFile(entry) {
    if (!entry.category) { setError("파일의 자료 종류를 선택해 주세요."); return; }
    run(async (signal) => {
      const item = attachmentView(await api.createFileAttachment(entry.file, entry.category, { signal }));
      signal.throwIfAborted();
      const next = [...latest.current.attachments, item]; latest.current.attachments = next; latest.current.onChange(next);
      setPendingFiles((current) => current.filter((file) => file.id !== entry.id));
    });
  }
  function addLink() {
    run(async (signal) => {
      let url;
      try { url = new URL(link.includes("://") ? link.trim() : `https://${link.trim()}`); } catch { throw new Error("올바른 링크를 입력해 주세요."); }
      if (!["http:", "https:"].includes(url.protocol) || !url.hostname.includes(".")) throw new Error("HTTP(S) 링크를 입력해 주세요.");
      const selectedCategory = category ?? linkCategory;
      if (!selectedCategory) throw new Error("추가할 링크의 자료 종류를 선택해 주세요.");
      const item = attachmentView(await api.createLinkAttachment(url.href, selectedCategory, { signal }));
      if (!signal.aborted) { latest.current.onChange([...latest.current.attachments, item]); setLink(""); }
    });
  }
  return (
    <fieldset disabled={busy} className="flex min-w-0 flex-col gap-2" aria-busy={busy}>
      {label && <legend className="text-label text-ink-muted">{label}</legend>}
      <ul aria-label="첨부 자료" className="flex flex-wrap gap-2">
        {attachments.map((a) => <li key={a.id} className="min-w-0 max-w-full">
          <AttachmentChip as="div" kind={a.kind} name={a.name} onRemove={() => run(async (signal) => {
            await api.deleteAttachment(a.attachmentId, { signal });
            if (!signal.aborted) latest.current.onChange(latest.current.attachments.filter((item) => item.id !== a.id));
          })} />
          <p className="text-caption text-ink-muted">자료 종류: {CATEGORY_OPTIONS.find(([value]) => value === a.category)?.[1] ?? a.category}</p>
          {EXTRACT_LABELS[a.extractStatus] && <p role="status" className="text-caption text-ink-subtle">{EXTRACT_LABELS[a.extractStatus]}</p>}
        </li>)}
      </ul>
      <div role="group" aria-label="파일 첨부" className="flex min-w-0 flex-col items-start gap-2">
        <p className="text-label text-ink-muted">파일 첨부</p>
        <p className="text-caption text-ink-subtle">{category === undefined ? "파일 선택 → 파일마다 자료 종류 선택 → 첨부" : "파일 선택 → 산출물 확인 → 첨부"}</p>
        <FileUploadButton label="+ 파일 선택" ariaLabel="파일 첨부" onSelect={addFiles} />
      {pendingFiles.length > 0 && <ul aria-label="첨부할 파일" className="flex w-full min-w-0 flex-col gap-2">
        {pendingFiles.map((entry) => <li key={entry.id} className="flex min-w-0 flex-wrap items-center gap-2 rounded-xl border border-line bg-white p-3">
          <span className="w-full break-all text-body-sm">{entry.file.name}</span>
          {category === undefined ? <label className="text-label text-ink-muted">자료 종류 <select aria-label={`${entry.file.name} 자료 종류`} value={entry.category} onChange={(event) => setPendingFiles((current) => current.map((file) => file.id === entry.id ? { ...file, category: event.target.value } : file))} className="min-w-0 rounded border border-line bg-white p-1 text-label">
            <option value="" disabled>자료 종류 선택</option>
            {CATEGORY_OPTIONS.map(([value, name]) => <option key={value} value={value}>{name}</option>)}
          </select></label> : <span className="text-label">자료 종류: {CATEGORY_OPTIONS.find(([value]) => value === category)?.[1] ?? category}</span>}
          <button type="button" disabled={!entry.category} aria-label={`${entry.file.name} 첨부`} className="rounded-full bg-ink px-3 py-1 text-label text-white disabled:opacity-40" onClick={() => uploadFile(entry)}>첨부</button>
          <button type="button" aria-label={`${entry.file.name} 선택 취소`} className="text-label text-ink-subtle" onClick={() => setPendingFiles((current) => current.filter((file) => file.id !== entry.id))}>취소</button>
        </li>)}
      </ul>}
      </div>
      <div role="group" aria-label="링크 첨부" className="flex min-w-0 flex-col gap-2">
        <p className="text-label text-ink-muted">링크 첨부</p>
        {category === undefined && <label className="text-label text-ink-muted">추가할 링크의 자료 종류 <select aria-label="추가할 링크의 자료 종류" value={linkCategory} onChange={(event) => setLinkCategory(event.target.value)} className="rounded border border-line bg-white p-1">
          <option value="" disabled>자료 종류 선택</option>
          {CATEGORY_OPTIONS.map(([value, name]) => <option key={value} value={value}>{name}</option>)}
        </select></label>}
        <LinkInputRow aria-label="링크" placeholder={linkPlaceholder} value={link} onChange={setLink} onAdd={addLink} />
      </div>
      {busy && <p role="status">첨부 자료를 처리하고 있어요…</p>}
      {error && <p role="alert" className="text-label text-tint-red-ink">{error} <button type="button" onClick={() => { setError(""); setRetry((n) => n + 1); }}>상태 다시 확인</button></p>}
    </fieldset>
  );
}
