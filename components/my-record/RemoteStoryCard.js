"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import { getStoryCard, updateStoryCard, deleteStoryCard } from "@/lib/myRecordApi";
import { cardView } from "@/lib/projectViewModel";
import StoryCardDetail from "./StoryCardDetail";
import RecordRequestStatus from "./RecordRequestStatus";
import useRecordResource from "./useRecordResource";
import Button from "@/components/ui/Button";

// 프로젝트 화면과 사자록이 동일한 카드 상세·편집 UI와 API를 사용한다.
export default function RemoteStoryCard({ cardId, titleId, competencyItems, onClose, onChanged }) {
  const { authenticatedRequest } = useAuth();
  const load = useCallback(async (signal) => cardView(await getStoryCard(cardId, { signal, request: authenticatedRequest })), [cardId, authenticatedRequest]);
  const resource = useRecordResource(load, String(cardId));
  const [saved, setSaved] = useState(null);
  const card = saved ?? resource.data;
  if (!card) return <div>
    <h2 id={titleId} className="text-title">카드 내용 보기</h2>
    {resource.error?.status === 404 ? <p role="status" className="py-4 text-body-sm">카드를 찾을 수 없어요. 삭제되었거나 접근할 수 없는 카드예요.</p>
      : <RecordRequestStatus resource={resource}>카드를 불러오는 중이에요.</RecordRequestStatus>}
    <Button variant="secondary" onClick={onClose}>닫기</Button>
  </div>;
  return <StoryCardDetail card={card} titleId={titleId} competencies={competencyItems} onClose={onClose}
    onUpdate={async (changes, signal) => {
      const data = await updateStoryCard(cardId, { title: changes.title, fullMarkdown: changes.document,
        ...changes.summary, competencyIds: changes.tags.map((name) => competencyItems.find((item) => item.name === name)?.id) }, { signal, request: authenticatedRequest });
      if (signal?.aborted) return;
      setSaved(cardView(data));
      await onChanged?.(data, card);
    }}
    onDelete={async (signal) => {
      await deleteStoryCard(cardId, { signal, request: authenticatedRequest });
      if (signal?.aborted) return;
      const changed = onChanged?.(null, card);
      onClose();
      await changed;
    }} />;
}
