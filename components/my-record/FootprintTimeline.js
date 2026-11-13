import { useEffect, useRef } from "react";
import DrawnBorder from "@/components/ui/DrawnBorder";
import FootprintSticker, { CurrentWeekSticker } from "./FootprintSticker";

const LABEL_CLASSES = {
  done: "text-ink",
  none: "text-ink-300",
  current: "font-bold text-accent",
  upcoming: "text-ink-300",
};

function WeekIcon({ week }) {
  const { status, shape } = week;

  if (status === "none") {
    return (
      <span className="size-2 rounded-full bg-line-strong" />
    );
  }

  if (status === "upcoming") {
    return <span className="size-[26px] rounded-full border-[1.5px] border-dashed border-ink-300" />;
  }

  if (status === "current") {
    return <CurrentWeekSticker />;
  }

  return <FootprintSticker week={week.week} isProjectRecap={shape === "sun"} />;
}

export default function FootprintTimeline({
  sections,
  weeks,
  showSectionNames,
  selectedWeek,
  onSelectWeek,
}) {
  const scrollerRef = useRef(null);
  const firstWeek = weeks[0]?.week ?? 1;

  // 전체 보기로 들어올 때 선택한 주차가 보이도록 가로 스크롤을 맞춘다. 주차를 누를 때는 움직이지 않는다.
  useEffect(() => {
    if (!showSectionNames) {
      return;
    }

    const scroller = scrollerRef.current;
    const selected = scroller.querySelector('[aria-pressed="true"]');

    if (selected) scroller.scrollLeft = selected.offsetLeft - (scroller.clientWidth - selected.offsetWidth) / 2;
  }, [showSectionNames]);

  const getGridColumn = (startWeek, endWeek) =>
    `${startWeek - firstWeek + 1} / span ${endWeek - startWeek + 1}`;

  return (
    <div className="relative w-full rounded-[28px] border-2 border-transparent bg-white">
      <DrawnBorder variant="thin-outline" repeat="round" color="var(--color-ink)" />
      <div
        ref={scrollerRef}
        className="relative w-full overflow-x-auto rounded-[26px] px-5 pt-6 pb-4"
      >
        <div
          className={`grid gap-x-1 gap-y-2.5 ${
            showSectionNames ? "min-w-[1482px]" : "min-w-max"
          }`}
          style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(36px, 1fr))` }}
        >
          {showSectionNames &&
            sections.map(({ id, label, startWeek, endWeek }) => (
              <p
                key={id}
                className="row-start-1 self-end whitespace-nowrap border-b border-ink px-1.5 pb-2 text-label text-ink"
                style={{ gridColumn: getGridColumn(startWeek, endWeek) }}
              >
                {label}
              </p>
            ))}
          {sections
            .filter(({ isProject }) => isProject)
            .map(({ id, label, startWeek, endWeek }) => (
              <p
                key={id}
                className="flex h-[26px] items-center self-end justify-self-start whitespace-nowrap rounded-full bg-shape-yellow px-3 text-caption text-ink"
                style={{ gridColumn: getGridColumn(startWeek, endWeek), gridRow: showSectionNames ? 2 : 1 }}
              >
                {label}
              </p>
            ))}
          {weeks.map((week) => {
            const isSelected = week.week === selectedWeek;

            return (
              <button
                key={week.week}
                type="button"
                aria-pressed={isSelected}
                aria-label={`${week.week}주차 ${week.title ?? "예정"}`}
                onClick={() => onSelectWeek(week.week)}
                className={`flex w-[38px] cursor-pointer flex-col items-center gap-1.5 self-end justify-self-center rounded-xl pt-1.5 pb-1 ${
                  week.status === "current" ? "bg-white shadow-[inset_0_0_0_2px_var(--color-ink)]"
                    : isSelected ? "bg-white shadow-[0_0_0_1.5px_var(--color-ink)]" : ""
                }`}
                style={{ gridColumn: week.week - firstWeek + 1,
                  gridRow: showSectionNames ? 3 : sections.some(({ isProject }) => isProject) ? 2 : 1 }}
              >
                <span aria-hidden="true" className="flex size-[38px] shrink-0 items-center justify-center rounded-xl">
                  <WeekIcon week={week} />
                </span>
                <span className={`text-caption leading-4 ${LABEL_CLASSES[week.status]}`}>
                  {week.week}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
