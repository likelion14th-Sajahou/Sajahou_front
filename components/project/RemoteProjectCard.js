"use client";

import { useEffect, useState } from "react";
import StoryCardDetail from "@/components/my-record/StoryCardDetail";
import { useMockData } from "@/components/layout/MockDataProvider";
import * as api from "@/lib/projectApi";
import { cardView } from "@/lib/projectViewModel";

export default function RemoteProjectCard({ cardId, titleId, onClose }) {
  const { projectData } = useMockData();
  const [card, setCard] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    api.getProjectCard(cardId, { signal: controller.signal }).then((data) => { if (!controller.signal.aborted) setCard(cardView(data)); })
      .catch((error) => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [cardId, attempt]);
  if (!card) return <div><p id={titleId} role={error ? "alert" : "status"}>{error || "카드를 불러오고 있어요…"}</p>{error && <button onClick={() => setAttempt((n) => n + 1)}>다시 시도</button>}</div>;
  return <StoryCardDetail card={card} titleId={titleId} competencies={projectData.competencyItems.map((c) => c.name)} onClose={onClose}
    onUpdate={async (changes) => {
      const data = await api.updateProjectCard(cardId, { title: changes.title, fullMarkdown: changes.document,
        ...changes.summary, competencyIds: changes.tags.map((name) => projectData.competencyItems.find((c) => c.name === name)?.id) });
      setCard(cardView(data)); await projectData.sync(card.projectId);
    }}
    onDelete={async () => { await api.deleteProjectCard(cardId); await projectData.sync(card.projectId); onClose(); }} />;
}
