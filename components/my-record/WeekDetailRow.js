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

// 항상 그 주차 카드만 걸러서 보여 준다. 카드가 1장이면 그 카드 팝업도 함께 연다(card 값).
function WeekName({ week }) {
  return <span className="text-label text-accent">{week}주차</span>;
}

function WeekTitle({ title }) {
  return <span className="text-[16px] font-bold text-ink">{title}</span>;
}

function WeekState({ children }) {
  return <span className="text-label leading-[19.5px] text-ink-subtle">{children}</span>;
}

export default function WeekDetailRow({ week, searchParams }) {
  if (!week) return null;
  const { status, title, cardCount } = week;

  if (status === "upcoming") {
    return (
      <div className={`${MUTED_ROW_CLASSES} [&_span]:text-[#9a958c]`}>
        <DrawnBorder variant="thin-outline" repeat="round" color="var(--color-line)" />
        <WeekName week={week.week} />
        <WeekState>예정</WeekState>
      </div>
    );
  }

  if (status === "current") {
    return (
      <Link href="/retrospective" className={ACTIVE_ROW_CLASSES}>
        <DrawnBorder variant="thick-outline" repeat="round" color="var(--color-ink)" />
        <WeekName week={week.week} />
        <WeekTitle title={title} />
        <span className="ml-auto flex h-[38px] items-center rounded-full bg-shape-yellow px-[18px] text-body-sm text-ink">
          회고 쓰기 →
        </span>
      </Link>
    );
  }

  if (status === "done" && cardCount > 0) {
    const href = weekDestination(week, searchParams);
    const label = cardCount === 1 ? "카드 보기 →" : `카드 ${cardCount}장 보기 →`;

    return (
      <Link href={href} className={ACTIVE_ROW_CLASSES}>
        <DrawnBorder variant="thick-outline" repeat="round" color="var(--color-ink)" />
        <WeekName week={week.week} />
        <WeekTitle title={title} />
        <WeekState>{getRecapLabel(week)}</WeekState>
        <span className="ml-auto text-body-sm text-accent">{label}</span>
      </Link>
    );
  }

  return (
    <div className={`${MUTED_ROW_CLASSES} [&_span]:text-[#9a958c]`}>
      <DrawnBorder variant="thin-outline" repeat="round" color="var(--color-line)" />
      <WeekName week={week.week} />
      <WeekTitle title={title} />
      <WeekState>{status === "done" ? getRecapLabel(week) : "기록 없음"}</WeekState>
    </div>
  );
}
