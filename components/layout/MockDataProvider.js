"use client";

import { createContext, use, useState } from "react";
import { MOCK_PROJECTS } from "@/lib/mock/projects";
import { MOCK_STORY_CARDS } from "@/lib/mock/storyCards";

const MockDataContext = createContext(null);

// 스토리 카드 중 프로젝트의 대표 카드에는 어느 프로젝트의 어떤 기록으로 만들었는지 함께 담는다.
const INITIAL_STORY_CARDS = MOCK_STORY_CARDS.map((card) => {
  for (const { id: projectId, representativeCards } of MOCK_PROJECTS) {
    const representativeCard = representativeCards.find(({ cardId }) => cardId === card.id);

    if (representativeCard) {
      return { ...card, projectId, recordIds: representativeCard.recordIds, deletedRecordCount: 0 };
    }
  }

  return card;
});

// 대표 카드에 쓴 기록을 지워도 카드 글은 남기고, 근거에 지운 개수만 표시한다(H-15).
function withDeletedRecordEvidence(card) {
  return card.deletedRecordCount > 0
    ? { ...card, evidence: `${card.evidence} · 삭제된 기록 ${card.deletedRecordCount}개` }
    : card;
}

// API가 없는 동안 화면끼리 공유하는 목업 데이터다. 페이지를 옮겨 다녀도 유지되고, 새로고침하면 처음 값으로 돌아간다.
// API를 연결할 때 이 안쪽을 실제 요청으로 바꾸면 화면 코드는 그대로 쓸 수 있다.
export default function MockDataProvider({ children }) {
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [storyCards, setStoryCards] = useState(INITIAL_STORY_CARDS);

  function addProject(project) {
    setProjects((current) => [...current, project]);
  }

  function updateProject(projectId, update) {
    setProjects((current) =>
      current.map((project) => (project.id === projectId ? update(project) : project)),
    );
  }

  function addStoryCard(card) {
    setStoryCards((current) => [...current, card]);
  }

  function updateStoryCard(cardId, changes) {
    setStoryCards((current) =>
      current.map((card) => (card.id === cardId ? { ...card, ...changes } : card)),
    );
  }

  function deleteStoryCard(cardId) {
    setStoryCards((current) => current.filter(({ id }) => id !== cardId));
  }

  function removeRecordFromCards(recordId) {
    setStoryCards((current) =>
      current.map((card) =>
        card.recordIds?.includes(recordId)
          ? {
              ...card,
              recordIds: card.recordIds.filter((id) => id !== recordId),
              deletedRecordCount: card.deletedRecordCount + 1,
            }
          : card,
      ),
    );
  }

  return (
    <MockDataContext
      value={{
        projects,
        addProject,
        updateProject,
        storyCards: storyCards.map(withDeletedRecordEvidence),
        addStoryCard,
        updateStoryCard,
        deleteStoryCard,
        removeRecordFromCards,
      }}
    >
      {children}
    </MockDataContext>
  );
}

export function useMockData() {
  return use(MockDataContext);
}
