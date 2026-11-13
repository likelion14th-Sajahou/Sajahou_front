const TONE_CLASSES = {
  blue: "bg-tint-blue text-tint-blue-ink",
  purple: "bg-tint-purple text-tint-purple-ink",
  yellow: "bg-tint-yellow text-tint-yellow-ink",
  amber: "bg-[#fff1d6] text-[#8a5a00]",
  red: "bg-tint-red text-tint-red-ink",
  green: "bg-tint-green text-tint-green-ink",
  neutral: "bg-canvas text-ink-muted",
  dark: "bg-ink text-white",
  // 회고 자료 화면 섹션 제목 옆의 형식 표시(PDF): 회색 바탕 + 흐린 글자(11/13 디자인)
  plain: "bg-canvas text-ink-faint",
};

const SIZE_CLASSES = {
  md: "px-2.5 py-[3px] text-caption",
  sm: "px-[9px] py-0.5 text-badge",
  xs: "px-2 py-0.5 text-[11px] leading-[1.6]",
  count: "px-2.5 py-[3px] text-[12.5px] leading-5",
  question: "px-2.5 py-1 text-label",
};

export default function Badge({
  tone = "neutral",
  size = "md",
  className = "",
  children,
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full ${TONE_CLASSES[tone]} ${SIZE_CLASSES[size]} ${className}`}
    >
      {children}
    </span>
  );
}
