"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import AttachmentChip from "./AttachmentChip";

const IMAGE_FILE = /\.(png|jpe?g|gif|webp|svg)$/i;

function getFileKind(fileName) {
  if (/\.pdf$/i.test(fileName)) {
    return "pdf";
  }

  return IMAGE_FILE.test(fileName) ? "image" : "notion";
}

// "www.figma.com/..."처럼 프로토콜 없이 붙여 넣어도 받되, http(s)만 허용한다.
function parseLink(value) {
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);

    return ["http:", "https:"].includes(url.protocol) && url.hostname.includes(".")
      ? `${url.hostname}${url.pathname === "/" ? "" : url.pathname}`
      : null;
  } catch {
    return null;
  }
}

export default function RecordAttachmentsField({
  label,
  attachments,
  linkPlaceholder = "피그마·노션·GitHub 링크",
  onChange,
}) {
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");

  function addFiles(event) {
    const files = Array.from(event.target.files, ({ name }) => ({
      id: crypto.randomUUID(),
      kind: getFileKind(name),
      name,
    }));

    onChange([...attachments, ...files]);
    event.target.value = "";
  }

  function addLink() {
    const name = parseLink(link.trim());

    if (!name) {
      setLinkError("올바른 링크를 입력해 주세요.");
      return;
    }

    onChange([...attachments, { id: crypto.randomUUID(), kind: "link", name }]);
    setLink("");
    setLinkError("");
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <p className="text-label text-ink-muted">{label}</p>}
      {attachments.length > 0 && (
        <ul aria-label="첨부 자료" className="flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <AttachmentChip
              key={attachment.id}
              attachment={attachment}
              onRemove={(id) => onChange(attachments.filter((item) => item.id !== id))}
            />
          ))}
        </ul>
      )}
      <div className="flex items-center gap-2">
        <label className="shrink-0 cursor-pointer rounded-xl border border-dashed border-[#c9c5bb] px-3 py-[7px] text-label text-ink-muted">
          + 파일
          <input type="file" multiple aria-label="파일 첨부" onChange={addFiles} className="sr-only" />
        </label>
        <div className="flex min-w-0 flex-1 gap-1.5">
          <TextField
            size="sm"
            aria-label="링크"
            placeholder={linkPlaceholder}
            value={link}
            onChange={(event) => {
              setLink(event.target.value);
              setLinkError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addLink();
              }
            }}
          />
          <Button variant="secondary" size="sm" onClick={addLink}>추가</Button>
        </div>
      </div>
      {linkError && <p role="alert" className="text-label text-tint-red-ink">{linkError}</p>}
    </div>
  );
}
