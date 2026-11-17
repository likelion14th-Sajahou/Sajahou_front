import Link from "next/link";

// primary·secondary는 디자인 시스템(Figma 'Button')의 Primary·Secondary다.
// Primary: 주요 동작, 노란 바탕. Secondary: 보조 동작, 회색 바탕. 동작 요소는 모두 삼립호빵체다.
// Secondary는 회색 바탕이라 흰 카드 안에 둔다(회색 페이지 바탕 위에서는 잘 안 보인다).
// soft·inverse는 진한 카드(회고 시작 카드) 위에 두는 버튼이다. soft: 연노랑 바탕, inverse: 흰 선.
// ink·ink-outline은 흰 카드(휴회 카드) 위의 진한 버튼과 진한 선 버튼이다.
// inverse-muted·cta는 진한 카드(회고 자료 카드) 하단의 '임시 저장'(회색 선)와 'AI 질문 받기'(노랑)다.
// cta-ink는 밝은 카드 위의 노란 버튼이다.
// 버튼은 손그림 선 없이 매끈하다(이슈 #65, Figma '테두리 샘플'). 바탕이 있는 버튼은 선이 없고,
// 선만 있는 버튼(inverse·inverse-muted·ink-outline)은 같은 색의 곧은 2px 선을 둔다.
const VARIANT_CLASSES = {
  primary: "border border-yellow-400 bg-yellow-400 font-display text-ink",
  secondary: "border border-canvas bg-canvas text-ink",
  outline: "border border-line bg-white text-ink",
  accent: "border border-accent bg-accent text-white",
  highlight: "border border-shape-yellow bg-shape-yellow text-ink",
  danger: "border border-ink bg-danger text-white",
  soft: "border-2 border-transparent bg-yellow-100 font-display text-ink",
  inverse: "border-2 border-white bg-transparent font-display text-white",
  ink: "border-2 border-transparent bg-ink-900 font-display text-white",
  "ink-outline": "border-2 border-ink bg-white font-display text-ink",
  "inverse-muted": "border-2 border-ink-300 bg-transparent font-display text-white",
  cta: "border-2 border-transparent bg-yellow-400 font-display text-ink-950",
  // 흰·연회색 카드 위의 노란 주요 버튼(회고 검토의 '저장하고 사자록에 추가')
  "cta-ink": "border-2 border-transparent bg-yellow-400 font-display text-ink",
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
  const classes = `relative inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full text-center disabled:cursor-default disabled:border-line disabled:bg-line disabled:text-[#6b6358] ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`;

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
