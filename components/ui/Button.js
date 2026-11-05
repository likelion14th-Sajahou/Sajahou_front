import Link from "next/link";

const VARIANT_CLASSES = {
  primary: "border-ink bg-ink text-white",
  secondary: "border-ink bg-white text-ink",
  accent: "border-accent bg-accent text-white",
  highlight: "border-shape-yellow bg-shape-yellow text-ink",
  danger: "border-ink bg-[#b42318] text-white",
};

const SIZE_CLASSES = {
  md: "h-[46px] px-[22px] text-body",
  sm: "h-[38px] px-4 text-body-sm",
};

export default function Button({
  variant = "primary",
  size = "md",
  href,
  type = "button",
  className = "",
  children,
  ...rest
}) {
  const classes = `inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full border text-center disabled:cursor-default disabled:border-line disabled:bg-line disabled:text-[#6b6358] ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`;

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
