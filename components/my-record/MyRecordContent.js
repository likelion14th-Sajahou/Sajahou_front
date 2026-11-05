import FootprintsPanel from "./FootprintsPanel";
import MyRecordTabs from "./MyRecordTabs";
import StoryCardList from "./StoryCardList";

export default async function MyRecordContent({ searchParams, record }) {
  const { tab, week } = await searchParams;
  const activeTab = tab === "cards" ? "cards" : "footprints";
  const { currentWeek, storyCards, footprintSections, footprintWeeks } = record;
  const requestedWeek = footprintWeeks.find((item) => item.week === Number(week));

  return (
    <>
      <MyRecordTabs activeTab={activeTab} storyCardCount={storyCards.length} />
      {activeTab === "footprints" && (
        <FootprintsPanel
          sections={footprintSections}
          weeks={footprintWeeks}
          initialWeek={requestedWeek?.week ?? currentWeek}
        />
      )}
      {activeTab === "cards" && <StoryCardList cards={storyCards} />}
    </>
  );
}
