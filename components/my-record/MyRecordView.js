"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import { useMockData } from "@/components/layout/MockDataProvider";
import { getFootprints, getStoryCards } from "@/lib/myRecordApi";
import { footprintView, footprintSections } from "@/lib/myRecordViewModel";
import { cardView } from "@/lib/projectViewModel";
import { readRecordLocation, recordHref } from "@/lib/myRecordNavigation";
import FootprintsPanel from "./FootprintsPanel";
import MyRecordTabs from "./MyRecordTabs";
import StoryCardsPanel from "./StoryCardsPanel";
import useRecordResource from "./useRecordResource";
import RecordRequestStatus from "./RecordRequestStatus";

export default function MyRecordView() {
  const params = useSearchParams();
  const location = readRecordLocation(params);
  const { user, projectData } = useMockData();
  const { authenticatedRequest } = useAuth();
  const loadFootprints = useCallback(async (signal) => footprintView(await getFootprints({ signal, request: authenticatedRequest })), [authenticatedRequest]);
  const loadCards = useCallback((signal) => getStoryCards({}, { signal, request: authenticatedRequest }), [authenticatedRequest]);
  const footprints = useRecordResource(loadFootprints, String(user.id));
  const cardList = useRecordResource(loadCards, String(user.id));
  const competencyItems = projectData.competencyItems;
  const [revision, setRevision] = useState(0);
  const cards = cardList.data?.cards.map(cardView) ?? [];
  function navigate(changes, replace = false) {
    const href = recordHref(new URLSearchParams(window.location.search), changes);
    window.history[replace ? "replaceState" : "pushState"](null, "", href);
  }
  async function onChanged(data, previous) {
    // PATCH 응답 또는 DELETE 204 확인 뒤에만 화면의 원본을 갱신한다.
    cardList.updateData((current) => ({ ...current,
      cards: data ? current.cards.map((card) => String(card.cardId) === previous.id ? data : card)
        : current.cards.filter((card) => String(card.cardId) !== previous.id),
      totalCount: data ? current.totalCount : Math.max(0, current.totalCount - 1) }));
    if (!data) footprints.updateData((current) => ({ ...current, weeks: current.weeks.map((week) => {
      const cardIds = week.cardIds.filter((id) => id !== previous.id);
      return { ...week, cardIds, cardCount: cardIds.length };
    }) }));
    setRevision((value) => value + 1);
    cardList.refresh();
    footprints.refresh();
    await projectData.sync(previous.projectId);
  }
  return <>
    <MyRecordTabs activeTab={location.tab} storyCardCount={cardList.data?.totalCount ?? "…"} searchParams={params} />
    {(cardList.error && cardList.data || footprints.error && footprints.data || projectData.syncWarning) && (
      <p role="alert" className="pt-3 text-body-sm text-ink-muted">
        변경은 완료됐지만 일부 정보를 다시 불러오지 못했어요. <button type="button" className="underline" onClick={() => {
          cardList.refresh(); footprints.refresh(); void projectData.sync();
        }}>다시 불러오기</button>
      </p>
    )}
    {location.tab === "footprints" && (footprints.data ? (
      <FootprintsPanel sections={footprintSections} weeks={footprints.data.weeks}
        selectedWeek={location.week ?? footprints.data.currentWeek} sectionId={location.section}
        onChange={navigate} searchParams={params} />
    ) : <RecordRequestStatus resource={footprints} />)}
    {location.tab === "cards" && !competencyItems.length && projectData.status !== "ready" ? (
      <RecordRequestStatus resource={{ loading: projectData.status === "loading", error: projectData.error,
        refresh: () => { void projectData.sync(); } }}>역량 목록을 불러오는 중이에요.</RecordRequestStatus>
    ) : location.tab === "cards" && (cardList.data ? (
      <StoryCardsPanel cards={cards} competencyItems={competencyItems} userId={user.id}
        location={location} searchParams={params} onNavigate={navigate}
        revision={revision} onChanged={onChanged} />
    ) : <RecordRequestStatus resource={cardList} />)}
  </>;
}
