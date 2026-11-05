"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProjectHeader from "./ProjectHeader";
import ProjectRecords from "./ProjectRecords";
import ProjectSidebar from "./ProjectSidebar";

// 기록의 "카드 N에 쓰임"은 대표 카드 순서로 계산해서, 카드를 지우면 함께 바뀐다.
// 프로젝트 API가 없어 변경은 화면 안에서만 반영된다.
export default function ProjectView({ project, storyCards, competencies }) {
  const [projectRecords, setProjectRecords] = useState(project.records);
  // 다른 페이지에 다녀와도 상태가 유지되므로(cacheComponents), 링크로 새로 들어오면 열려 있던 폼과 팝업을 닫는다.
  // 뒤로 가기로 돌아오면 bfcacheId가 그대로라 작성 중인 내용이 남는다. 기록과 카드 변경은 어느 경우든 유지한다.
  const { bfcacheId } = useRouter();
  const [cards, setCards] = useState(() =>
    project.representativeCards.map(({ recordIds }, index) => ({
      ...storyCards[index],
      recordIds,
      deletedRecordCount: 0,
    })),
  );

  const displayCards = cards.map((card) =>
    card.deletedRecordCount > 0
      ? { ...card, evidence: `${card.evidence} · 삭제된 기록 ${card.deletedRecordCount}개` }
      : card,
  );

  const records = projectRecords.map((record) => ({
    ...record,
    cardNumbers: cards.flatMap(({ recordIds }, index) =>
      recordIds.includes(record.id) ? [index + 1] : [],
    ),
  }));

  function saveRecord(recordId, changes) {
    setProjectRecords((current) =>
      current.map((record) => (record.id === recordId ? { ...record, ...changes } : record)),
    );
  }

  // 대표 카드에 쓴 기록을 지워도 카드 글은 남기고, 근거에 지운 개수만 표시한다(H-15).
  function deleteRecord(recordId) {
    setProjectRecords((current) => current.filter(({ id }) => id !== recordId));
    setCards((current) =>
      current.map((card) =>
        card.recordIds.includes(recordId)
          ? {
              ...card,
              recordIds: card.recordIds.filter((id) => id !== recordId),
              deletedRecordCount: card.deletedRecordCount + 1,
            }
          : card,
      ),
    );
  }

  function updateCard(cardId, changes) {
    setCards((current) =>
      current.map((card) => (card.id === cardId ? { ...card, ...changes } : card)),
    );
  }

  function deleteCard(cardId) {
    setCards((current) => current.filter(({ id }) => id !== cardId));
  }

  return (
    <>
      <ProjectHeader
        project={project}
        recordCount={records.length}
        lastRecordedAt={records[0]?.date}
      />
      <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-5 pt-6">
        <ProjectRecords
          key={`records-${bfcacheId}`}
          project={project}
          records={records}
          onSaveRecord={saveRecord}
          onDeleteRecord={deleteRecord}
        />
        <ProjectSidebar
          key={`sidebar-${bfcacheId}`}
          status={project.status}
          cards={displayCards}
          competencies={competencies}
          onUpdateCard={updateCard}
          onDeleteCard={deleteCard}
        />
      </div>
    </>
  );
}
