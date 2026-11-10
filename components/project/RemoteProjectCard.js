"use client";

import { useMockData } from "@/components/layout/MockDataProvider";
import RemoteStoryCard from "@/components/my-record/RemoteStoryCard";

export default function RemoteProjectCard({ cardId, titleId, onClose }) {
  const { projectData } = useMockData();
  return <RemoteStoryCard key={cardId} cardId={cardId} titleId={titleId}
    competencyItems={projectData.competencyItems} onClose={onClose}
    onChanged={async (_data, card) => { await projectData.sync(card.projectId); }} />;
}
