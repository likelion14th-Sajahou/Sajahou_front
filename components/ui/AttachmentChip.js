import Badge from "@/components/ui/Badge";

// 회고 자료, 프로젝트 기록, 자소서 매칭 공고가 함께 쓰는 첨부 칩이다.
// kind: "pdf" | "notion" | "image" | "link". 링크는 시안(10, 12, 13)의 보라색이다.
const ATTACHMENT_BADGES = {
  file: { label: "파일", tone: "dark" },
  pdf: { label: "PDF", tone: "red" },
  notion: { label: "노션 MD", tone: "dark" },
  image: { label: "이미지", tone: "green" },
  link: { label: "링크", tone: "purple" },
};

// status: 칩 안 이름 뒤에 붙는 표시(예: 매칭의 '읽지 못함'). warning이면 칩 배경을 주황으로 바꾼다.
export default function AttachmentChip({ as: Tag = "li", kind, name, status, warning = false, onRemove }) {
  const { label, tone } = ATTACHMENT_BADGES[kind];

  return (
    <Tag
      className={`inline-flex min-w-0 max-w-full items-center gap-2 rounded-xl border border-line py-1.5 pr-2 pl-2.5 text-label text-ink ${warning ? "bg-[#fff1ea]" : "bg-white"}`}
    >
      <Badge tone={tone} size="xs">{label}</Badge>
      {/* 긴 이름은 데스크톱에서 말줄임하고, 좁은 화면에서는 줄을 바꿔 모두 보여 준다. */}
      <span className="min-w-0 truncate max-sm:overflow-visible max-sm:break-all max-sm:whitespace-normal" title={name}>
        {name}
      </span>
      {status}
      {onRemove && (
        <button
          type="button"
          aria-label={`${name} 빼기`}
          onClick={onRemove}
          className="shrink-0 cursor-pointer px-1 py-0.5 text-[16px] leading-4 text-ink-subtle"
        >
          ×
        </button>
      )}
    </Tag>
  );
}
