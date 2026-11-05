import Link from "next/link";

const ROW_CLASSES =
  "flex w-full items-center gap-3.5 rounded-[24px] border border-ink bg-white px-5 py-3.5";

function getRecapLabel({ cardCount, isProjectRecap }) {
  const recap = isProjectRecap ? "프로젝트 회고 완료" : "회고 완료";

  return cardCount > 0 ? `${recap} · 카드 ${cardCount}장` : recap;
}

// 항상 그 주차 카드만 걸러서 보여 준다. 카드가 1장이면 그 카드 팝업도 함께 연다(card 값).
function getCardLink({ week, cardIds, cardCount }) {
  const href = `/my-record?tab=cards&week=${week}`;

  if (cardCount === 1) {
    return { href: `${href}&card=${cardIds[0]}`, label: "카드 보기 →" };
  }

  return { href, label: `카드 ${cardCount}장 보기 →` };
}

function WeekName({ week }) {
  return <span className="text-label text-accent-strong">{week}주차</span>;
}

function WeekTitle({ title }) {
  return <span className="text-[16px] text-ink">{title}</span>;
}

function WeekState({ children }) {
  return <span className="text-label leading-[19.5px] text-ink-subtle">{children}</span>;
}

export default function WeekDetailRow({ week }) {
  const { status, title, cardCount } = week;

  if (status === "upcoming") {
    return (
      <div className={ROW_CLASSES}>
        <WeekName week={week.week} />
        <WeekState>예정</WeekState>
      </div>
    );
  }

  if (status === "current") {
    return (
      <Link href="/retrospective" className={ROW_CLASSES}>
        <WeekName week={week.week} />
        <WeekTitle title={title} />
        <span className="ml-auto flex h-[38px] items-center rounded-full border border-ink bg-ink px-4 text-body-sm text-white">
          회고 쓰기 →
        </span>
      </Link>
    );
  }

  if (status === "done" && cardCount > 0) {
    const { href, label } = getCardLink(week);

    return (
      <Link href={href} className={ROW_CLASSES}>
        <WeekName week={week.week} />
        <WeekTitle title={title} />
        <WeekState>{getRecapLabel(week)}</WeekState>
        <span className="ml-auto text-body-sm text-accent-strong">{label}</span>
      </Link>
    );
  }

  return (
    <div className={ROW_CLASSES}>
      <WeekName week={week.week} />
      <WeekTitle title={title} />
      <WeekState>{status === "done" ? getRecapLabel(week) : "기록 없음"}</WeekState>
    </div>
  );
}
