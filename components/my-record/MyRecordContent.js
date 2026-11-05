import FootprintsPanel from "./FootprintsPanel";
import MyRecordTabs from "./MyRecordTabs";
import StoryCardsPanel from "./StoryCardsPanel";

export default async function MyRecordContent({ searchParams, record }) {
  const { tab, week, card } = await searchParams;
  const activeTab = tab === "cards" ? "cards" : "footprints";
  const { currentWeek, competencies, storyCards, footprintSections, footprintWeeks } = record;
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
      {activeTab === "cards" && (
        <StoryCardsPanel
          cards={storyCards}
          competencies={competencies}
          week={requestedWeek?.week}
          initialCardId={card}
        />
      )}
    </>
  );
}
