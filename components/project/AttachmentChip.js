import Badge from "@/components/ui/Badge";

const ATTACHMENT_BADGES = {
  pdf: { label: "PDF", tone: "red" },
  notion: { label: "노션 MD", tone: "dark" },
  image: { label: "이미지", tone: "green" },
  link: { label: "링크", tone: "purple" },
};

export default function AttachmentChip({ attachment, onRemove }) {
  const { label, tone } = ATTACHMENT_BADGES[attachment.kind];

  return (
    <li className="flex items-center gap-2 rounded-xl border border-line bg-white py-1.5 pr-2 pl-2.5 text-label text-ink">
      <Badge tone={tone} size="xs">{label}</Badge>
      {attachment.name}
      {onRemove && (
        <button
          type="button"
          aria-label={`${attachment.name} 빼기`}
          onClick={() => onRemove(attachment.id)}
          className="cursor-pointer px-1 py-0.5 text-[16px] leading-4 text-ink-subtle"
        >
          ×
        </button>
      )}
    </li>
  );
}
