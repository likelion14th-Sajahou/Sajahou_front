import Link from "next/link";

// primary·secondary는 디자인 시스템(Figma 'Button')의 Primary·Secondary다.
// Primary: 주요 동작, 노란 바탕 + 삼립호빵체. Secondary: 보조 동작, 회색 바탕 + Noto Sans KR.
// Secondary는 회색 바탕이라 흰 카드 안에 둔다(회색 페이지 바탕 위에서는 잘 안 보인다).
// soft·inverse는 진한 카드(회고 시작 카드) 위에 두는 버튼이다. soft: 연노랑 바탕, inverse: 흰 굵은 테두리.
const VARIANT_CLASSES = {
  primary: "border border-yellow-400 bg-yellow-400 font-display text-ink",
  secondary: "border border-canvas bg-canvas font-noto font-medium text-ink",
  outline: "border border-line bg-white text-ink",
  accent: "border border-accent bg-accent text-white",
  highlight: "border border-shape-yellow bg-shape-yellow text-ink",
  danger: "border border-ink bg-danger text-white",
  soft: "border-4 border-yellow-100 bg-yellow-100 font-display text-ink",
  inverse: "border-4 border-white bg-transparent font-display text-white",
};

const SIZE_CLASSES = {
  md: "h-12 px-[22px] text-body leading-6",
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
  const classes = `inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full text-center disabled:cursor-default disabled:border-line disabled:bg-line disabled:text-[#6b6358] ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`;

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
