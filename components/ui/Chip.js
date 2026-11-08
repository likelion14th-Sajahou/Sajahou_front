import Link from "next/link";

const SIZE_CLASSES = {
  md: "h-9 px-3.5 text-body-sm",
  sm: "h-8 px-3 text-label",
};

// href를 주면 같은 모양의 링크가 된다(예: 회고의 세션·과제 전환 탭).
export default function Chip({
  selected = false,
  size = "md",
  href,
  className = "",
  children,
  ...rest
}) {
  const stateClasses = selected
    ? "border-ink bg-ink text-white"
    : "border-line bg-white text-ink-muted";

  const classes = `inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full border text-center ${stateClasses} ${SIZE_CLASSES[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} aria-current={selected ? "page" : undefined} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" aria-pressed={selected} className={classes} {...rest}>
      {children}
    </button>
  );
}
