import Link from "next/link";
import DrawnBorder from "@/components/ui/DrawnBorder";

const SIZE_CLASSES = {
  md: "h-9 px-3.5 text-body-sm [--drawn-border-height:36px]",
  sm: "h-8 px-3 text-label [--drawn-border-height:32px]",
};

// href를 주면 같은 모양의 링크가 된다(예: 회고의 세션·과제 전환 탭).
// drawn: 손그림 테두리 + 삼립호빵체(회고 자료 화면의 '있었어요·없었어요' 등). 테두리는 DrawnBorder가 그린다.
export default function Chip({
  selected = false,
  size = "md",
  drawn = false,
  href,
  className = "",
  children,
  ...rest
}) {
  // 디자인 시스템(Figma 'Part Chip'): 선택은 진한 바탕 + 흰 글씨, 기본은 흰 바탕 + 회색 테두리.
  const stateClasses = drawn
    ? `relative font-display ${selected ? "bg-ink text-white" : "bg-white text-ink"}`
    : `border ${selected ? "border-ink bg-ink text-white" : "border-line bg-white text-ink"}`;

  const classes = `inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full text-center ${stateClasses} ${SIZE_CLASSES[size]} ${className}`;
  const content = (
    <>
      {children}
      {drawn && <DrawnBorder variant={selected ? "chip-ink" : "chip-line"} />}
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-current={selected ? "page" : undefined} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" aria-pressed={selected} className={classes} {...rest}>
      {content}
    </button>
  );
}
