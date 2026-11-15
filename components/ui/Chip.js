import Link from "next/link";
import DrawnBorder from "@/components/ui/DrawnBorder";

const SIZE_CLASSES = {
  // 나의 사자록의 구간·카드 유형 거르기
  lg: "h-[38px] px-4 text-body-sm [--drawn-border-height:38px]",
  md: "h-9 px-3.5 text-body-sm [--drawn-border-height:36px]",
  sm: "h-8 px-3 text-label [--drawn-border-height:32px]",
};

// href를 주면 같은 모양의 링크가 된다(예: 회고의 세션·과제 전환 탭).
// 모든 칩은 동작 요소라 삼립호빵체다. drawn은 DrawnBorder로 손그림 테두리를 그린다.
export default function Chip({
  selected = false,
  selectedTone = "ink",
  size = "md",
  drawn = false,
  href,
  className = "",
  children,
  ...rest
}) {
  // 자료 종류(yellow)는 기본 노란 선을 유지하고, 선택하면 노란 배경과 더 진한 선으로 표시한다.
  // highlight: 선은 기본(ink)과 같고, 선택하면 배경만 노란색이다(사자 발자국 구간 선택).
  const yellowTone = selectedTone === "yellow";
  const selectedClasses = { yellow: "bg-yellow-400 text-ink-800", highlight: "bg-yellow-400 text-ink" }[selectedTone] ?? "bg-ink text-white";
  const unselectedClasses = yellowTone ? "bg-white text-ink-800" : "bg-white text-ink";
  const borderClasses = yellowTone ? (selected ? "border-yellow-500" : "border-yellow-400") : (selected ? "border-ink" : "border-line");
  const stateClasses = drawn
    ? `relative ${selected ? selectedClasses : unselectedClasses}`
    : `border ${borderClasses} ${selected ? selectedClasses : unselectedClasses}`;
  const focusClasses = yellowTone ? "focus:outline-none" : "";

  const classes = `font-display inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full text-center ${stateClasses} ${focusClasses} ${SIZE_CLASSES[size]} ${className}`;
  const content = (
    <>
      {children}
      {drawn && <DrawnBorder variant={selected ? "chip-ink" : "chip-line"} color={yellowTone ? (selected ? "var(--color-yellow-500)" : "var(--color-yellow-400)") : undefined} />}
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
