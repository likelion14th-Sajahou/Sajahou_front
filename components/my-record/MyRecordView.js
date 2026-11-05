"use client";

import { useState } from "react";
import FootprintsPanel from "./FootprintsPanel";
import MyRecordTabs from "./MyRecordTabs";
import StoryCardsPanel from "./StoryCardsPanel";

// 두 탭이 같은 카드 목록을 쓰도록 여기서 관리한다.
// 카드 API가 없어 삭제는 화면 안에서만 반영되고, 새로고침하면 되돌아온다.
export default function MyRecordView({ record, activeTab, week, initialCardId }) {
  const { currentWeek, competencies, storyCards, footprintSections, footprintWeeks } = record;
  const [cards, setCards] = useState(storyCards);

  const weeksWithCards = footprintWeeks.map((item) => {
    const cardIds = cards.filter((card) => card.week === item.week).map(({ id }) => id);

    return { ...item, cardIds, cardCount: cardIds.length };
  });

  function deleteCard(cardId) {
    setCards((current) => current.filter(({ id }) => id !== cardId));
  }

  return (
    <>
      <MyRecordTabs activeTab={activeTab} storyCardCount={cards.length} />
      {activeTab === "footprints" && (
        <FootprintsPanel
          sections={footprintSections}
          weeks={weeksWithCards}
          initialWeek={week ?? currentWeek}
        />
      )}
      {activeTab === "cards" && (
        <StoryCardsPanel
          cards={cards}
          competencies={competencies}
          week={week}
          initialCardId={initialCardId}
          onDeleteCard={deleteCard}
        />
      )}
    </>
  );
}
