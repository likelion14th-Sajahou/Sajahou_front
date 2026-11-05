"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FootprintsPanel from "./FootprintsPanel";
import MyRecordTabs from "./MyRecordTabs";
import StoryCardsPanel from "./StoryCardsPanel";

// 두 탭이 같은 카드 목록을 쓰도록 여기서 관리한다.
// 카드 API가 없어 수정과 삭제는 화면 안에서만 반영되고, 새로고침하면 되돌아온다.
export default function MyRecordView({ record, activeTab, week, initialCardId }) {
  const { currentWeek, competencies, storyCards, footprintSections, footprintWeeks } = record;
  const [cards, setCards] = useState(storyCards);
  // cacheComponents가 켜져 있으면 다른 페이지에 다녀와도 상태가 유지된다.
  // 스티커나 카드를 눌러 새로 들어온 경우에는 주소 값을 다시 읽도록 key로 초기화하고,
  // 뒤로 가기로 돌아온 경우에는 bfcacheId가 그대로라 보던 상태가 유지된다.
  const { bfcacheId } = useRouter();

  const weeksWithCards = footprintWeeks.map((item) => {
    const cardIds = cards.filter((card) => card.week === item.week).map(({ id }) => id);

    return { ...item, cardIds, cardCount: cardIds.length };
  });

  function deleteCard(cardId) {
    setCards((current) => current.filter(({ id }) => id !== cardId));
  }

  function updateCard(cardId, changes) {
    setCards((current) =>
      current.map((card) => (card.id === cardId ? { ...card, ...changes } : card)),
    );
  }

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
          key={initialCardId ? bfcacheId : "story-cards"}
          cards={cards}
          competencies={competencies}
          week={week}
          initialCardId={initialCardId}
          onDeleteCard={deleteCard}
          onUpdateCard={updateCard}
        />
      )}
    </>
  );
}
