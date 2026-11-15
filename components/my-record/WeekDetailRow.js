import Link from "next/link";
import DrawnBorder from "@/components/ui/DrawnBorder";
import { weekDestination } from "@/lib/myRecordNavigation";

const ROW_CLASSES =
  "relative flex min-h-[78px] w-full flex-wrap items-center gap-x-3.5 gap-y-2 rounded-[20px] px-[22px] py-[18px]";
const ACTIVE_ROW_CLASSES = `${ROW_CLASSES} border-2 border-transparent bg-white`;
const MUTED_ROW_CLASSES = `${ROW_CLASSES} border-[1.5px] border-transparent bg-[#fafaf8]`;

// 회고 상태 · 프로젝트 완료(stickers) · 카드 수를 한 줄로 잇는다. 발표 주에는 회고와 프로젝트 완료가 함께 있을 수 있다.
// 이번 주는 '회고 쓰기' 버튼이 상태를 대신한다.
function getStateLabel({ status, cardCount, stickers }) {
  const recap = { done: "회고 완료", upcoming: "예정", none: "기록 없음" }[status];
  // 카드 수는 그 주 회고 카드와, 발표 주라면 완료한 프로젝트의 카드까지 센다(/footprints cardIds).
  return [recap, stickers.length > 0 && "프로젝트 완료", status !== "current" && cardCount > 0 && `카드 ${cardCount}장`]
    .filter(Boolean).join(" · ");
}

function WeekName({ week }) {
  return <span className="rounded-full bg-yellow-200 px-2.5 py-0.5 text-label leading-[20.8px] text-yellow-700">{week}주차</span>;
}

function WeekTitle({ title, completed = false }) {
  return <span className={`text-[16px] ${completed ? "font-normal text-[#1f2433]" : "font-bold"}`}>{title}</span>;
}

function WeekState({ children, completed = false }) {
  return <span className={`text-label leading-[19.5px] ${completed ? "text-[#5a606c]" : ""}`}>{children}</span>;
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
      <DrawnBorder variant="thin-outline" repeat="round" color={href ? "var(--color-ink)" : "var(--color-line)"} />
      <WeekName week={week.week} />
      {!upcoming && <WeekTitle title={title} completed={completed} />}
      {stateLabel && <WeekState completed={completed}>{stateLabel}</WeekState>}
      {current ? (
        <span className="ml-auto flex h-[38px] items-center rounded-full bg-shape-yellow px-[18px] text-body-sm">
          회고 쓰기 →
        </span>
      ) : hasCards ? (
        <span className="ml-auto text-body-sm text-yellow-700">{cardLabel}</span>
      ) : null}
    </Container>
  );
}
