import { useEffect, useRef } from "react";
import { TimelinePlaceholder, TimelineSticker } from "./TimelineShape";

const LABEL_CLASSES = {
  done: "text-ink",
  none: "text-[#9a958c]",
  current: "text-accent-strong",
  upcoming: "text-ink",
};

function WeekIcon({ week }) {
  const { status, shape, color } = week;

  if (status === "none") {
    return (
      <span className="flex size-[34px] shrink-0 items-center justify-center">
        <span className="size-[10.88px] rounded-full bg-[#c9c5bb]" />
      </span>
    );
  }

  if (status === "upcoming") {
    return <TimelinePlaceholder shape={shape} />;
  }

  if (status === "current") {
    return <TimelineSticker shape="circle" color="accent" outlined={false} />;
  }

  return <TimelineSticker shape={shape} color={color} />;
}

export default function FootprintTimeline({
  sections,
  weeks,
  showSectionNames,
  selectedWeek,
  onSelectWeek,
}) {
  const scrollerRef = useRef(null);
  const firstWeek = weeks[0].week;

  // 전체 보기로 들어올 때 선택한 주차가 보이도록 가로 스크롤을 맞춘다. 주차를 누를 때는 움직이지 않는다.
  useEffect(() => {
    if (!showSectionNames) {
      return;
    }

    const scroller = scrollerRef.current;
    const selected = scroller.querySelector('[aria-pressed="true"]');

    scroller.scrollLeft = selected.offsetLeft - (scroller.clientWidth - selected.offsetWidth) / 2;
  }, [showSectionNames]);

  const getGridColumn = (startWeek, endWeek) =>
    `${startWeek - firstWeek + 1} / span ${endWeek - startWeek + 1}`;

  return (
    <div
      ref={scrollerRef}
      className="relative w-full overflow-x-auto rounded-[28px] bg-white px-5 pt-6 pb-4"
    >
      <div
        className={`grid grid-rows-[auto_26px_62px] gap-x-1 gap-y-2.5 ${
          showSectionNames ? "min-w-[1482px]" : ""
        }`}
        style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
      >
        {showSectionNames &&
          sections.map(({ id, label, startWeek, endWeek }) => (
            <p
              key={id}
              className="row-start-1 self-end truncate border-b border-ink px-1.5 pb-2 text-label text-ink"
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
              className="row-start-2 flex h-[26px] items-center self-end justify-self-start whitespace-nowrap rounded-full border border-ink bg-shape-yellow px-3 text-caption text-ink"
              style={{ gridColumn: getGridColumn(startWeek, endWeek) }}
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
              className={`row-start-3 flex w-[34.1px] cursor-pointer flex-col items-center gap-1.5 self-end justify-self-center rounded-[10px] py-1 ${
                isSelected ? "bg-white shadow-[0_0_0_1.5px_var(--color-ink)]" : ""
              }`}
              style={{ gridColumn: week.week - firstWeek + 1 }}
            >
              <WeekIcon week={week} />
              <span className={`text-[11px] leading-[14px] ${LABEL_CLASSES[week.status]}`}>
                {week.week}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
