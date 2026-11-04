const TONE_CLASSES = {
  blue: "bg-tint-blue text-tint-blue-ink",
  yellow: "bg-tint-yellow text-tint-yellow-ink",
  red: "bg-tint-red text-tint-red-ink",
  green: "bg-tint-green text-tint-green-ink",
  neutral: "bg-canvas text-ink-muted",
  dark: "bg-ink text-white",
};

const SIZE_CLASSES = {
  md: "px-2.5 py-[3px] text-caption",
  sm: "px-[9px] py-0.5 text-badge",
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
