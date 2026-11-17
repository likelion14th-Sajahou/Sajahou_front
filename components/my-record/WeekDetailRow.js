import Link from "next/link";
import { weekDestination } from "@/lib/myRecordNavigation";

const ROW_CLASSES =
  "relative flex min-h-[78px] w-full min-w-0 items-center gap-2 rounded-[20px] px-3 py-[18px] sm:gap-3.5 sm:px-[22px]";
const ACTIVE_ROW_CLASSES = `${ROW_CLASSES} border-2 border-ink bg-white`;
const MUTED_ROW_CLASSES = `${ROW_CLASSES} border-[1.5px] border-line bg-surface-muted`;

// 회고 상태 · 프로젝트 완료(stickers) · 카드 수를 한 줄로 잇는다. 발표 주에는 회고와 프로젝트 완료가 함께 있을 수 있다.
// 이번 주는 '회고 쓰기' 버튼이 상태를 대신한다.
function getStateLabel({ status, cardCount, stickers }) {
  const recap = { done: "회고 완료", upcoming: "예정", none: "기록 없음" }[status];
  // 카드 수는 그 주 회고 카드와, 발표 주라면 완료한 프로젝트의 카드까지 센다(/footprints cardIds).
  return [recap, stickers.length > 0 && "프로젝트 완료", status !== "current" && cardCount > 0 && `카드 ${cardCount}장`]
    .filter(Boolean).join(" · ");
}

function WeekName({ week }) {
  return <span className="shrink-0 whitespace-nowrap rounded-full bg-yellow-200 px-2.5 py-0.5 text-label leading-[20.8px] text-yellow-700">{week}주차</span>;
}

function WeekTitle({ title, completed = false }) {
  return <span title={title} className={`min-w-0 flex-1 truncate text-[16px] sm:flex-initial ${completed ? "font-normal text-ink-strong" : "font-bold"}`}>{title}</span>;
}

function WeekState({ children, completed = false }) {
  return <span title={children} className={`min-w-0 max-w-[40%] truncate text-caption leading-[19.5px] sm:max-w-none sm:shrink-0 sm:text-label ${completed ? "text-ink-secondary" : ""}`}>{children}</span>;
}

export default function WeekDetailRow({ week, searchParams }) {
  if (!week) return null;
  const { status, title, cardCount } = week;
  const completed = status === "done";
  const current = status === "current";
  const upcoming = status === "upcoming";
  // 회고를 안 한 주라도 프로젝트를 완료해 카드가 생겼으면 보여 준다. 이번 주는 '회고 쓰기'가 우선이다.
  const hasCards = !current && cardCount > 0;
  // 카드 1장은 상세, 여러 장은 해당 주차 목록으로 이동하는 기존 규칙을 사용한다.
  const href = weekDestination(week, searchParams);
  const Container = href ? Link : "div";
  const textColorClass = current ? "text-ink-strong" : completed ? "text-ink" : "text-[#9a958c]";
  const stateLabel = getStateLabel(week);
  const cardLabel = cardCount === 1 ? "카드 보기 →" : `카드 ${cardCount}장 보기 →`;

  return (
    <Container {...(href ? { href } : {})} className={`${href ? ACTIVE_ROW_CLASSES : MUTED_ROW_CLASSES} ${textColorClass}`}>
      <WeekName week={week.week} />
      {!upcoming && <WeekTitle title={title} completed={completed} />}
      {stateLabel && <WeekState completed={completed}>{stateLabel}</WeekState>}
      {current ? (
        <span className="ml-auto flex h-[38px] shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-shape-yellow px-3 text-body-sm sm:px-[18px]">
          <span aria-hidden="true" className="sm:hidden">→</span>
          <span className="sr-only sm:not-sr-only">회고 쓰기 →</span>
        </span>
      ) : hasCards ? (
        <span className="ml-auto shrink-0 whitespace-nowrap text-body-sm text-yellow-700">
          <span aria-hidden="true" className="sm:hidden">→</span>
          <span className="sr-only sm:not-sr-only">{cardLabel}</span>
        </span>
      ) : null}
    </Container>
  );
}
