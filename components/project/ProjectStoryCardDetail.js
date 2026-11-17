"use client";

import { useAppData } from "@/components/layout/AppDataProvider";
import StoryCardDetailLoader from "@/components/story-card/StoryCardDetailLoader";

export default function ProjectStoryCardDetail({ cardId, titleId, onClose }) {
  const { projectData } = useAppData();
  return <StoryCardDetailLoader key={cardId} cardId={cardId} titleId={titleId}
    competencyItems={projectData.competencyItems} onClose={onClose}
    onChanged={async (_data, card) => { await projectData.sync(card.projectId); }} />;
}
