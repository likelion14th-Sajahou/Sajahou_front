import { useEffect, useRef } from "react";
import DrawnBorder from "@/components/ui/DrawnBorder";
import FootprintSticker, { CurrentWeekSticker } from "./FootprintSticker";

const LABEL_CLASSES = {
  done: "text-ink",
  none: "text-ink-300",
  current: "font-bold text-accent",
  upcoming: "text-ink-300",
};

// 아이콘 우선순위: 프로젝트 스티커(stickers) → 회고 상태(status). 발표 주는 회고와 프로젝트 완료가 함께 있을 수 있다.
function WeekIcon({ week }) {
  const { status, stickers } = week;

  if (stickers.length > 0) {
    return <FootprintSticker week={week.week} category={stickers[0]} />;
  }

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

  return <FootprintSticker week={week.week} />;
}

function ProjectCapsule({ label }) {
  return (
    <span className="inline-flex h-[26px] items-center whitespace-nowrap rounded-full bg-shape-yellow px-3 text-caption text-ink">
      {label}
    </span>
  );
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
  // 구간 이름 줄(전체 보기)이 있으면 주차는 둘째 줄에 놓인다.
  const weekRow = showSectionNames ? 2 : 1;

  return (
    <div className="relative w-full rounded-[28px] border-2 border-transparent bg-white px-5 pt-6 pb-4">
      <DrawnBorder variant="thin-outline" repeat="round" color="var(--color-ink)" />
      <div
        ref={scrollerRef}
        // 선택 테두리(38px)가 주차 칸(최소 36px)보다 넓어 양 끝 주차에서 잘리지 않도록, 스크롤 영역 안쪽에 좌우 여백을 두고 그만큼 밖으로 넓힌다.
        className="relative -mx-1 w-[calc(100%+8px)] overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div
          className={`grid gap-x-1 gap-y-2.5 ${
            showSectionNames ? "min-w-[1482px]" : "min-w-max"
          }`}
          style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(36px, 1fr))` }}
        >
          {/* 전체 보기: 구간 이름이 선 위에 놓인다. 프로젝트 구간은 이름을 노란 캡슐 안에 넣는다(11/14 QA). */}
          {showSectionNames &&
            sections.map(({ id, label, startWeek, endWeek, isProject }) => (
              <p
                key={id}
                className="row-start-1 self-end whitespace-nowrap border-b border-ink px-1.5 pb-2 text-label text-ink"
                style={{ gridColumn: getGridColumn(startWeek, endWeek) }}
              >
                {isProject ? <ProjectCapsule label={label} /> : label}
              </p>
            ))}
          {weeks.map((week) => {
            const isSelected = week.week === selectedWeek;

            return (
              <button
                key={week.week}
                type="button"
                aria-pressed={isSelected}
                aria-label={`${week.week}주차 ${week.title ?? "예정"}${week.stickers.length > 0 ? " · 프로젝트 완료" : ""}`}
                onClick={() => onSelectWeek(week.week)}
                className={`flex w-[38px] cursor-pointer flex-col items-center gap-1.5 self-end justify-self-center rounded-xl pt-1.5 pb-1 ${
                  isSelected ? "bg-white shadow-[inset_0_0_0_1.5px_var(--color-ink)]" : ""
                }`}
                style={{ gridColumn: week.week - firstWeek + 1, gridRow: weekRow }}
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
