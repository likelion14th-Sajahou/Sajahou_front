import { useState } from "react";
import AttachmentChip from "@/components/ui/AttachmentChip";
import FileUploadButton from "@/components/ui/FileUploadButton";
import LinkInputRow from "@/components/ui/LinkInputRow";

const PUBLIC_FILE = /\.(pdf|png|jpe?g)$/i;

// 고른 파일(file)과 예시 파일(name, kind)을 칩에 쓸 이름과 종류로 맞춘다.
function toFileChip(item) {
  const name = item.name ?? item.file.name;
  const isPdf = item.kind ? item.kind === "PDF" : name.toLowerCase().endsWith(".pdf");

  return { id: item.id, name, kind: isPdf ? "pdf" : "image" };
}

export default function MatchingAttachments({ files, links, onFilesChange, onLinksChange }) {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  function addLink() {
    try {
      const value = link.trim();
      if (!value) throw new Error();
      const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`);
      if (!["https:", "http:"].includes(url.protocol) || !url.hostname.includes(".") || url.username || url.password) throw new Error();
      if (links.some((item) => item.url === url.href)) {
        setError("이미 추가한 링크예요.");
        return;
      }
      onLinksChange([...links, { id: crypto.randomUUID(), url: url.href }]);
      setLink("");
      setError("");
    } catch {
      setError("올바른 http 또는 https 공고 링크를 입력해 주세요.");
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <p className="text-label text-ink-muted">채용 공고 <span className="text-ink-subtle">· 붙여넣기, PDF·캡처, 링크 중 편한 것</span></p>
        <ul aria-label="첨부 공고" className="flex flex-wrap gap-2">
          {files.map(toFileChip).map(({ id, name, kind }) => (
            <AttachmentChip key={id} kind={kind} name={name} onRemove={() => onFilesChange(files.filter((item) => item.id !== id))} />
          ))}
          {links.map((item) => (
            <AttachmentChip
              key={item.id}
              kind="link"
              name={item.url.replace(/^https?:\/\//, "")}
              warning={item.unreadable}
              status={item.unreadable && <span className="shrink-0 rounded-full bg-[#ffe0d1] px-2 py-0.5 text-badge text-[#b03a00]">읽지 못함</span>}
              onRemove={() => onLinksChange(links.filter(({ id }) => id !== item.id))}
            />
          ))}
        </ul>
      {links.some(({ unreadable }) => unreadable) && (
        <p role="status" className="flex items-start gap-2 rounded-xl bg-tint-yellow px-3 py-2.5 text-label text-tint-yellow-ink">
          <span aria-hidden="true">⚑</span>
          <span>이 링크는 본문을 못 읽었어요. 로그인이 필요하거나 접근이 막힌 사이트예요. 공고 내용을 아래에 붙여 넣거나 PDF·캡처로 올려 주세요.</span>
        </p>
      )}
      <div className="flex items-center gap-2">
        <FileUploadButton
          label="+ 공고 파일"
          ariaLabel="공고 파일"
          accept=".pdf,.png,.jpg,.jpeg"
          onSelect={(selected) => {
            const valid = selected.filter((file) => PUBLIC_FILE.test(file.name));
            onFilesChange([...files, ...valid.map((file) => ({ id: crypto.randomUUID(), file }))]);
            setError(valid.length !== selected.length ? "PDF, PNG, JPG 파일을 선택해 주세요." : "");
          }}
        />
        <LinkInputRow
          aria-label="공고 링크"
          placeholder="공고 링크"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "matching-attachment-error" : undefined}
          value={link}
          onChange={(value) => { setLink(value); setError(""); }}
          onAdd={addLink}
        />
      </div>
      <p id="matching-attachment-error" role="alert" className="sr-only">{error}</p>
    </div>
  );
}
