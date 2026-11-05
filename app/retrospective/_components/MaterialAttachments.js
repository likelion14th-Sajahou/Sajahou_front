import Badge from "@/components/ui/Badge";

const FILE_BADGES = {
  pdf: { label: "PDF", tone: "red" },
  notion: { label: "노션 MD", tone: "dark" },
  image: { label: "이미지", tone: "green" },
  link: { label: "링크", tone: "blue" },
};

// 파일 목록과 업로드 컨트롤을 세션·실습·과제에서 함께 사용한다.
export default function MaterialAttachments({
  files,
  onRemove,
  onSelect,
  accept,
  uploadLabel,
  uploadOnNewLine = false,
  children,
}) {
  const fileItems = files.map(({ id, name, kind }) => {
    const badge = FILE_BADGES[kind];
    return (
      <li key={id} className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-xl border border-line py-1.5 pr-2 pl-2.5 text-label">
        <Badge tone={badge.tone} size="sm" className="text-[11px] leading-[1.6]">
          {badge.label}
        </Badge>
        <span className="min-w-0 truncate max-sm:overflow-visible max-sm:break-all max-sm:whitespace-normal" title={name}>{name}</span>
        <button type="button" aria-label={`${name} 빼기`} onClick={() => onRemove(id)} className="shrink-0 cursor-pointer px-1 py-0.5 text-[16px] leading-4 text-ink-subtle">
          ×
        </button>
      </li>
    );
  });

  const upload = (
    <label className="relative inline-flex shrink-0 cursor-pointer items-center rounded-xl border border-dashed border-[#c9c5bb] px-3 py-[7px] text-label text-ink-muted focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink">
      {uploadLabel}
      <input
        type="file"
        accept={accept}
        multiple
        aria-label={uploadLabel}
        className="sr-only"
        onChange={(event) => {
          onSelect(Array.from(event.target.files));
          event.target.value = "";
        }}
      />
    </label>
  );

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {uploadOnNewLine ? (
        <>
          {files.length > 0 && <ul aria-label="첨부 자료" className="flex min-w-0 max-w-full flex-wrap items-center gap-2">{fileItems}</ul>}
          <div className="flex flex-wrap items-center gap-2">{upload}{children}</div>
        </>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {files.length > 0 && <ul aria-label="첨부 자료" className="flex min-w-0 max-w-full flex-wrap items-center gap-2">{fileItems}</ul>}
          {upload}
        </div>
      )}
    </div>
  );
}
