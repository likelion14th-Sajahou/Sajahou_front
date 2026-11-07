"use client";

import { useRouter } from "next/navigation";
import { useMockData } from "@/components/layout/MockDataProvider";
import FootprintsPanel from "./FootprintsPanel";
import MyRecordTabs from "./MyRecordTabs";
import StoryCardsPanel from "./StoryCardsPanel";

export default function MyRecordView({
  record,
  requestedTab,
  week,
  requestedCardId,
  requestedHighlightId,
  requestedCompetency,
}) {
  const { currentWeek, footprintSections } = record;
  const { competencies, footprintWeeks, storyCards, updateStoryCard, deleteStoryCard } = useMockData();
  // 파트를 바꿔 보면 지금 파트 목록에 없는 태그를 단 카드가 생길 수 있어, 걸러 보기에는 그 태그도 목록 뒤에 붙인다.
  const filterCompetencies = [
    ...new Set([...competencies, ...storyCards.flatMap(({ tags }) => tags)]),
  ];
  const initialCompetency = filterCompetencies.find((name) => name === requestedCompetency);
  // 프로젝트에서 새로 만든 카드도 주차 순서에 맞게 보여 준다.
  const cards = storyCards.toSorted((a, b) => b.week - a.week);
  const initialCardId = cards.find(({ id }) => id === requestedCardId)?.id;
  const initialHighlightedCardId = cards.find(({ id }) => id === requestedHighlightId)?.id;
  // 다른 화면에서 카드로 이동해 오면 스토리 카드 탭으로 연다.
  const activeTab =
    requestedTab === "cards" || initialCardId || initialHighlightedCardId || initialCompetency
      ? "cards"
      : "footprints";
  // cacheComponents가 켜져 있으면 다른 페이지에 다녀와도 상태가 유지된다.
  // 스티커나 카드를 눌러 새로 들어온 경우에는 주소 값을 다시 읽도록 key로 초기화하고,
  // 뒤로 가기로 돌아온 경우에는 bfcacheId가 그대로라 보던 상태가 유지된다.
  const { bfcacheId } = useRouter();

  const weeksWithCards = footprintWeeks.map((item) => {
    const cardIds = cards.filter((card) => card.week === item.week).map(({ id }) => id);

    return { ...item, cardIds, cardCount: cardIds.length };
  });

  return (
    <>
      <MyRecordTabs activeTab={activeTab} storyCardCount={cards.length} />
      {activeTab === "footprints" && (
        <FootprintsPanel
          key={bfcacheId}
          sections={footprintSections}
          weeks={weeksWithCards}
          initialWeek={week ?? currentWeek}
        />
      )}
      {activeTab === "cards" && (
        <StoryCardsPanel
          key={initialCardId || initialHighlightedCardId || initialCompetency ? bfcacheId : "story-cards"}
          cards={cards}
          competencies={competencies}
          filterCompetencies={filterCompetencies}
          week={week}
          initialCardId={initialCardId}
          initialHighlightedCardId={initialHighlightedCardId}
          initialCompetency={initialCompetency}
          onDeleteCard={deleteStoryCard}
          onUpdateCard={updateStoryCard}
        />
      )}
    </>
  );
}
