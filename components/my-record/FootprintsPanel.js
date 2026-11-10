"use client";

import Chip from "@/components/ui/Chip";
import FootprintLegend from "./FootprintLegend";
import FootprintTimeline from "./FootprintTimeline";
import WeekDetailRow from "./WeekDetailRow";

const ALL_SECTIONS = "all";

export default function FootprintsPanel({ sections, weeks, selectedWeek, sectionId, onChange, searchParams }) {
  const selectedSection = sections.find(({ id }) => id === sectionId);
  const visibleWeeks = selectedSection
    ? weeks.filter(
        ({ week }) => week >= selectedSection.startWeek && week <= selectedSection.endWeek,
      )
    : weeks;
  const chips = [{ id: ALL_SECTIONS, label: "전체" }, ...sections];

  return (
    <section aria-label="사자 발자국" className="flex flex-col gap-4 pt-5 pb-2">
      <div role="group" aria-label="구간 선택" className="flex flex-wrap gap-1.5">
        {chips.map(({ id, label }) => (
          <Chip
            key={id}
            size="sm"
            selected={id === sectionId}
            onClick={() => {
              const changes = { section: id };
              if (id !== ALL_SECTIONS) {
                const section = sections.find((section) => section.id === id);
                if (selectedWeek < section.startWeek || selectedWeek > section.endWeek) changes.week = section.startWeek;
              }
              onChange(changes);
            }}
          >
            {label}
          </Chip>
        ))}
      </div>
      <FootprintTimeline
        sections={selectedSection ? [selectedSection] : sections}
        weeks={visibleWeeks}
        showSectionNames={!selectedSection}
        selectedWeek={selectedWeek}
        onSelectWeek={(week) => onChange({ week })}
      />
      <FootprintLegend />
      <WeekDetailRow week={weeks.find(({ week }) => week === selectedWeek)} searchParams={searchParams} />
    </section>
  );
}
