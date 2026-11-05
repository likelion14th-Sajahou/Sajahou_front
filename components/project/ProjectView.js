"use client";

import { useState } from "react";
import ProjectRecords from "./ProjectRecords";
import ProjectSidebar from "./ProjectSidebar";

// 기록의 "카드 N에 쓰임"은 대표 카드 순서로 계산해서, 카드를 지우면 함께 바뀐다.
// 프로젝트 API가 없어 변경은 화면 안에서만 반영된다.
export default function ProjectView({ project, storyCards, competencies }) {
  const [cards, setCards] = useState(() =>
    project.representativeCards.map(({ recordIds }, index) => ({
      ...storyCards[index],
      recordIds,
    })),
  );

  const records = project.records.map((record) => ({
    ...record,
    cardNumbers: cards.flatMap(({ recordIds }, index) =>
      recordIds.includes(record.id) ? [index + 1] : [],
    ),
  }));

  function updateCard(cardId, changes) {
    setCards((current) =>
      current.map((card) => (card.id === cardId ? { ...card, ...changes } : card)),
    );
  }

  function deleteCard(cardId) {
    setCards((current) => current.filter(({ id }) => id !== cardId));
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-5 pt-6">
      <ProjectRecords project={project} records={records} />
      <ProjectSidebar
        status={project.status}
        cards={cards}
        competencies={competencies}
        onUpdateCard={updateCard}
        onDeleteCard={deleteCard}
      />
    </div>
  );
}
