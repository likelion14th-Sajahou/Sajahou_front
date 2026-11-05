"use client";

import { useState } from "react";
import Chip from "@/components/ui/Chip";
import FootprintLegend from "./FootprintLegend";
import FootprintTimeline from "./FootprintTimeline";
import WeekDetailRow from "./WeekDetailRow";

const ALL_SECTIONS = "all";

export default function FootprintsPanel({ sections, weeks, initialWeek }) {
  const [selectedSectionId, setSelectedSectionId] = useState(ALL_SECTIONS);
  const [selectedWeek, setSelectedWeek] = useState(initialWeek);

  const selectedSection = sections.find(({ id }) => id === selectedSectionId);
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
            selected={id === selectedSectionId}
            onClick={() => setSelectedSectionId(id)}
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
        onSelectWeek={setSelectedWeek}
      />
      <FootprintLegend />
      <WeekDetailRow week={weeks.find(({ week }) => week === selectedWeek)} />
    </section>
  );
}
