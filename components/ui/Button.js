import Link from "next/link";
import DrawnBorder from "@/components/ui/DrawnBorder";

// primary·secondary는 디자인 시스템(Figma 'Button')의 Primary·Secondary다.
// Primary: 주요 동작, 노란 바탕 + 삼립호빵체. Secondary: 보조 동작, 회색 바탕 + Noto Sans KR.
// Secondary는 회색 바탕이라 흰 카드 안에 둔다(회색 페이지 바탕 위에서는 잘 안 보인다).
// soft·inverse는 진한 카드(회고 시작 카드) 위에 두는 버튼이다. soft: 연노랑 바탕, inverse: 흰 굵은 테두리.
// ink·ink-outline은 흰 카드(휴회 카드) 위의 진한 버튼과 진한 테두리 버튼이다.
// inverse-muted·cta는 진한 카드(회고 자료 카드) 하단의 '나중에 이어쓰기'(회색 선)와 'AI 질문 받기'(노랑)다.
// 이 여섯 가지는 Figma에서 테두리가 손그림처럼 울퉁불퉁해서 DrawnBorder로 그린다(VARIANT_BORDERS).
const VARIANT_CLASSES = {
  primary: "border border-yellow-400 bg-yellow-400 font-display text-ink",
  secondary: "border border-canvas bg-canvas font-noto font-medium text-ink",
  outline: "border border-line bg-white text-ink",
  accent: "border border-accent bg-accent text-white",
  highlight: "border border-shape-yellow bg-shape-yellow text-ink",
  danger: "border border-ink bg-danger text-white",
  soft: "bg-yellow-100 font-display text-ink",
  // Figma 'Button' Type=Google. 색은 Google 로그인 버튼 안내(테두리 #747775, 글자 #1F1F1F)를 따른다.
  google: "border border-[#747775] bg-white font-noto font-medium text-[#1f1f1f]",
  inverse: "bg-transparent font-display text-white",
  ink: "bg-ink-900 font-display text-white",
  "ink-outline": "bg-white font-display text-ink",
  "inverse-muted": "bg-transparent font-display text-white",
  cta: "bg-yellow-400 font-display text-ink-950",
};

// 크기별 테두리 이미지. 크기에 맞는 이미지가 없으면 md 것을 쓴다.
const VARIANT_BORDERS = {
  soft: { md: "pill-cream" },
  inverse: { md: "pill-white" },
  ink: { md: "pill-ink", sm: "pill-ink-sm" },
  "ink-outline": { md: "pill-ink", sm: "pill-ink-sm" },
  "inverse-muted": { md: "pill-muted" },
  cta: { md: "pill-yellow" },
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
  borderColor,
  children,
  ...rest
}) {
  const classes = `relative inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full text-center disabled:cursor-default disabled:border-line disabled:bg-line disabled:text-[#6b6358] ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`;

  const borders = VARIANT_BORDERS[variant];
  const border = borders?.[size] ?? borders?.md;
  const content = (
    <>
      {children}
      {border && <DrawnBorder variant={border} color={borderColor} />}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...rest}>
      {content}
    </button>
  );
}
