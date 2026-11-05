import { useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";

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
      {(files.length > 0 || links.length > 0) && (
        <ul aria-label="첨부 공고" className="flex flex-wrap gap-2">
          {[...files.map((file) => ({ ...file, label: file.file.name, kind: file.file.name.toLowerCase().endsWith(".pdf") ? "PDF" : "이미지" })), ...links.map((item) => ({ ...item, label: item.url, kind: "링크" }))].map((item) => (
            <li key={item.id} className="inline-flex max-w-full items-center gap-2 rounded-xl border border-line py-1.5 pr-2 pl-2.5 text-label">
              <Badge tone={item.kind === "PDF" ? "red" : "blue"} size="sm">{item.kind}</Badge>
              <span className="min-w-0 truncate" title={item.label}>{item.label}</span>
              <button type="button" className="cursor-pointer px-1 py-0.5 text-[16px] leading-4 text-ink-subtle" aria-label={`${item.label} 빼기`} onClick={() => item.url ? onLinksChange(links.filter(({ id }) => id !== item.id)) : onFilesChange(files.filter(({ id }) => id !== item.id))}>×</button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center gap-2">
        <label className="inline-flex shrink-0 cursor-pointer items-center rounded-xl border border-dashed border-[#c9c5bb] px-3 py-[7px] text-label text-ink-muted focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink">
          + 공고 파일
          <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg" aria-label="공고 파일" className="sr-only" onChange={(event) => {
            const selected = Array.from(event.target.files);
            const valid = selected.filter((file) => /\.(pdf|png|jpe?g)$/i.test(file.name));
            onFilesChange([...files, ...valid.map((file) => ({ id: crypto.randomUUID(), file }))]);
            setError(valid.length !== selected.length ? "PDF, PNG, JPG 파일을 선택해 주세요." : "");
            event.target.value = "";
          }} />
        </label>
        <div className="flex min-w-0 flex-1 gap-1.5">
          <TextField size="sm" aria-label="공고 링크" placeholder="공고 링크" value={link} aria-invalid={Boolean(error)} aria-describedby={error ? "matching-attachment-error" : undefined} onChange={(event) => { setLink(event.target.value); setError(""); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addLink(); } }} />
          <Button size="sm" variant="secondary" onClick={addLink}>추가</Button>
        </div>
      </div>
      {error && <p id="matching-attachment-error" role="alert" className="text-label text-tint-red-ink">{error}</p>}
      {(files.length > 0 || links.length > 0) && <p className="text-label text-ink-subtle">파일과 링크는 이 화면에서만 보관해요. 본문 읽기는 준비 중이에요.</p>}
    </div>
  );
}
