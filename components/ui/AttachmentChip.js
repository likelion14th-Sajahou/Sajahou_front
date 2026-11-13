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

const STATUS_TONES = {
  neutral: "bg-canvas text-ink-subtle",
  warning: "bg-[#ffe0d1] text-[#b03a00]",
  success: "bg-tint-green text-tint-green-ink",
};

// 칩 안 이름 뒤에 붙는 작은 상태 표시다(예: '읽는 중', '본문 읽음', '읽지 못함'). warning은 주황, success는 초록이다.
export function ChipStatus({ tone = "neutral", children }) {
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-badge ${STATUS_TONES[tone]}`}>
      {children}
    </span>
  );
}

// status: 칩 안 이름 뒤에 붙는 표시(ChipStatus). warning이면 칩 배경을 주황으로 바꾼다.
// showKind: 형식 표시(PDF·노션 MD 등)를 붙일지. 회고 자료 화면(11/13 디자인)은 이름만 보여 준다.
// prefix: 이름 앞의 작은 표시(프로젝트 기록의 자료 종류 '회의록' 등).
export default function AttachmentChip({ as: Tag = "li", kind, name, prefix, status, warning = false, showKind = true, onRemove }) {
  const { label, tone } = ATTACHMENT_BADGES[kind];

  return (
    <Tag
      className={`inline-flex min-w-0 max-w-full items-center gap-2 rounded-xl border border-line py-1.5 pr-2 pl-2.5 text-label text-ink ${warning ? "bg-[#fff1ea]" : "bg-white"}`}
    >
      {showKind && <Badge tone={tone} size="xs">{label}</Badge>}
      {prefix && <Badge tone="plain" size="xs" className="text-ink-subtle!">{prefix}</Badge>}
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
