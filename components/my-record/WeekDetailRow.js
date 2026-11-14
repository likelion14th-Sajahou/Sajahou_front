import Link from "next/link";
import DrawnBorder from "@/components/ui/DrawnBorder";
import { weekDestination } from "@/lib/myRecordNavigation";

const ROW_CLASSES =
  "relative flex w-full flex-wrap items-center gap-x-3.5 gap-y-2 rounded-[20px] px-[22px] py-[18px]";
const ACTIVE_ROW_CLASSES = `${ROW_CLASSES} border-2 border-transparent bg-white`;
const MUTED_ROW_CLASSES = `${ROW_CLASSES} border-[1.5px] border-transparent bg-[#fafaf8]`;

function getRecapLabel({ cardCount, isProjectRecap }) {
  const recap = isProjectRecap ? "프로젝트 회고 완료" : "회고 완료";

  return cardCount > 0 ? `${recap} · 카드 ${cardCount}장` : recap;
}

function WeekName({ week, completed = false, current = false }) {
  return <span className={`text-label ${completed || current ? "text-accent-strong" : ""}`}>{week}주차</span>;
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
  const hasCards = completed && cardCount > 0;
  // 카드 1장은 상세, 여러 장은 해당 주차 목록으로 이동하는 기존 규칙을 사용한다.
  const href = current ? "/retrospective" : hasCards ? weekDestination(week, searchParams) : null;
  const Container = href ? Link : "div";
  const textColorClass = current ? "text-ink-strong" : completed ? "text-ink" : "text-[#9a958c]";
  const stateLabel = upcoming ? "예정" : completed ? getRecapLabel(week) : "기록 없음";
  const cardLabel = cardCount === 1 ? "카드 보기 →" : `카드 ${cardCount}장 보기 →`;

  return (
    <Container {...(href ? { href } : {})} className={`${href ? ACTIVE_ROW_CLASSES : MUTED_ROW_CLASSES} ${textColorClass}`}>
      <DrawnBorder variant="thin-outline" repeat="round" color={completed || current ? "var(--color-ink)" : "var(--color-line)"} />
      <WeekName week={week.week} completed={completed} current={current} />
      {!upcoming && <WeekTitle title={title} completed={completed} />}
      {!current && <WeekState completed={completed}>{stateLabel}</WeekState>}
      {current ? (
        <span className="ml-auto flex h-[38px] items-center rounded-full bg-shape-yellow px-[18px] text-body-sm">
          회고 쓰기 →
        </span>
      ) : hasCards ? (
        <span className="ml-auto text-body-sm text-accent">{cardLabel}</span>
      ) : null}
    </Container>
  );
}
