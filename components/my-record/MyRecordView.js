"use client";

import { useSearchParams } from "next/navigation";
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

const loadFootprints = async (signal) => footprintView(await getFootprints({ signal }));
const loadCards = (signal) => getStoryCards({}, { signal });

export default function MyRecordView() {
  const params = useSearchParams();
  const location = readRecordLocation(params);
  const { user, projectData, updateStoryCard, deleteStoryCard } = useMockData();
  const footprints = useRecordResource(loadFootprints, String(user.id));
  const cardList = useRecordResource(loadCards, String(user.id));
  const competencyItems = projectData.competencyItems;
  const cards = cardList.data?.cards.map(cardView) ?? [];
  function navigate(changes, replace = false) {
    const href = recordHref(new URLSearchParams(window.location.search), changes);
    window.history[replace ? "replaceState" : "pushState"](null, "", href);
  }
  return <>
    <MyRecordTabs activeTab={location.tab} storyCardCount={cardList.data?.totalCount ?? "…"} searchParams={params} />
    {location.tab === "footprints" && (footprints.data ? (
      <FootprintsPanel sections={footprintSections} weeks={footprints.data.weeks}
        selectedWeek={location.week ?? footprints.data.currentWeek} sectionId={location.section}
        onChange={navigate} searchParams={params} />
    ) : <RecordRequestStatus resource={footprints} />)}
    {location.tab === "cards" && (cardList.data ? (
      <StoryCardsPanel cards={cards} competencyItems={competencyItems} userId={user.id}
        location={location} searchParams={params} onNavigate={navigate}
        onDeleteCard={deleteStoryCard} onUpdateCard={updateStoryCard} />
    ) : <RecordRequestStatus resource={cardList} />)}
  </>;
}
