import Link from "next/link";

const VARIANT_CLASSES = {
  underline:
    "px-0.5 py-1 text-ink-muted underline decoration-from-font [text-underline-position:from-font]",
  border: "border-b border-ink text-ink",
  accent:
    "text-accent-strong underline decoration-from-font [text-underline-position:from-font]",
  danger:
    "px-0.5 py-1 text-[#b42318] underline decoration-from-font [text-underline-position:from-font]",
};

const SIZE_CLASSES = {
  md: "text-body-sm",
  sm: "text-label",
};

export default function TextLink({
  variant = "underline",
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
