import Link from "next/link";

const SIZE_CLASSES = {
  // 나의 사자록의 구간·카드 유형 거르기
  lg: "h-[38px] px-4 text-body-sm",
  md: "h-9 px-3.5 text-body-sm",
  sm: "h-8 px-3 text-label",
};

// href를 주면 같은 모양의 링크가 된다(예: 회고의 세션·과제 전환 탭).
// 모든 칩은 동작 요소라 삼립호빵체다.
// drawn: 디자인 칩(이슈 #65). 손그림 선 없이 매끈하다. 선택 전에는 곧은 1.5px 선, 선택하면 선 없이 바탕색만 바뀐다.
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
  // 자료 종류(yellow)는 기본 노란 선을 유지하고, 선택하면 노란 배경으로 표시한다.
  // highlight: 선택하면 노란 바탕이다(나의 사자록의 구간·카드 유형 거르기). 선택 전은 기본(ink)과 같다.
  const yellowTone = selectedTone === "yellow";
  const selectedClasses = { yellow: "bg-yellow-400 text-ink-800", highlight: "bg-yellow-400 text-ink" }[selectedTone] ?? "bg-ink text-white";
  const unselectedClasses = yellowTone ? "bg-white text-ink-800" : "bg-white text-ink";
  const borderClasses = yellowTone ? (selected ? "border-yellow-500" : "border-yellow-400") : (selected ? "border-ink" : "border-line");
  const drawnBorderClasses = selected ? "border-transparent" : yellowTone ? "border-yellow-400" : "border-line";
  const stateClasses = drawn
    ? `border-[1.5px] ${drawnBorderClasses} ${selected ? selectedClasses : unselectedClasses}`
    : `border ${borderClasses} ${selected ? selectedClasses : unselectedClasses}`;
  const focusClasses = yellowTone ? "focus:outline-none" : "";

  const classes = `font-display inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full text-center ${stateClasses} ${focusClasses} ${SIZE_CLASSES[size]} ${className}`;
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
