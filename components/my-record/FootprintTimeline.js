import { TimelinePlaceholder, TimelineSticker } from "./TimelineShape";

const COLUMN_COUNT = 39;

const LABEL_CLASSES = {
  done: "text-ink",
  none: "text-[#9a958c]",
  current: "text-accent-strong",
  upcoming: "text-ink",
};

function getGridColumn(startWeek, endWeek) {
  return `${startWeek} / span ${endWeek - startWeek + 1}`;
}

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

export default function FootprintTimeline({ sections, weeks, selectedWeek }) {
  return (
    <div className="w-full overflow-x-auto rounded-[28px] bg-white px-5 pt-6 pb-4">
      <div
        className="grid min-w-[1482px] grid-rows-[auto_26px_62px] gap-x-1 gap-y-2.5"
        style={{ gridTemplateColumns: `repeat(${COLUMN_COUNT}, minmax(0, 1fr))` }}
      >
        {sections.map(({ id, label, startWeek, endWeek }) => (
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
        {weeks.map((week) => (
          <div
            key={week.week}
            className={`row-start-3 flex flex-col items-center gap-1.5 self-end rounded-[10px] py-1 ${
              week.week === selectedWeek ? "bg-white shadow-[0_0_0_1.5px_var(--color-ink)]" : ""
            }`}
            style={{ gridColumn: week.week }}
          >
            <WeekIcon week={week} />
            <span className={`text-[11px] leading-[14px] ${LABEL_CLASSES[week.status]}`}>
              {week.week}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
