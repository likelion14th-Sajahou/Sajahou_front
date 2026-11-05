import FootprintLegend from "./FootprintLegend";
import FootprintTimeline from "./FootprintTimeline";
import MyRecordTabs from "./MyRecordTabs";

export default async function MyRecordContent({ searchParams, record }) {
  const { tab } = await searchParams;
  const activeTab = tab === "cards" ? "cards" : "footprints";
  const { currentWeek, storyCardCount, footprintSections, footprintWeeks } = record;

  return (
    <>
      <MyRecordTabs activeTab={activeTab} storyCardCount={storyCardCount} />
      {activeTab === "footprints" && (
        <section aria-label="사자 발자국" className="flex flex-col gap-4 pt-5 pb-2">
          <FootprintTimeline
            sections={footprintSections}
            weeks={footprintWeeks}
            selectedWeek={currentWeek}
          />
          <FootprintLegend />
        </section>
      )}
    </>
  );
}
