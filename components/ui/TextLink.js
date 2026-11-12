import Link from "next/link";

// link: 디자인 시스템(Figma 'Text Link'). 회색 삼립호빵체 + 아래 테두리선. 기본 모양이다.
// underline: 헤더의 로그아웃처럼 본문 글꼴에 밑줄만 긋는 링크.
const VARIANT_CLASSES = {
  link: "border-b border-ink-500 font-display leading-5 text-ink-500",
  underline:
    "px-0.5 py-1 text-ink-subtle underline decoration-from-font [text-underline-position:from-font]",
  border: "border-b border-ink text-ink",
  accent:
    "text-accent-strong underline decoration-from-font [text-underline-position:from-font]",
  danger:
    "px-0.5 py-1 text-danger underline decoration-from-font [text-underline-position:from-font]",
};

const SIZE_CLASSES = {
  md: "text-body-sm",
  sm: "text-label",
};

export default function TextLink({
  variant = "link",
  size = "md",
  href,
  type = "button",
  className = "",
  children,
  ...rest
}) {
  const classes = `inline-block shrink-0 cursor-pointer whitespace-nowrap ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
