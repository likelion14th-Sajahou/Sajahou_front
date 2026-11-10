"use client";

import { useRouter } from "next/navigation";
import { useMockData } from "@/components/layout/MockDataProvider";
import FootprintsPanel from "./FootprintsPanel";
import MyRecordTabs from "./MyRecordTabs";
import StoryCardsPanel from "./StoryCardsPanel";
import { getFootprints, getStoryCards } from "@/lib/myRecordApi";
import { cardView } from "@/lib/projectViewModel";
import { footprintView, footprintSections } from "@/lib/myRecordViewModel";
import useRecordResource from "./useRecordResource";
import RecordRequestStatus from "./RecordRequestStatus";

const loadFootprints = async (signal) => footprintView(await getFootprints({ signal }));
const loadCards = (signal) => getStoryCards({}, { signal });

export default function MyRecordView({
  requestedTab,
  week,
  requestedCardId,
  requestedHighlightId,
  requestedCompetency,
}) {
  const { user, projectData, updateStoryCard, deleteStoryCard } = useMockData();
  const footprints = useRecordResource(loadFootprints, String(user.id));
  const cardList = useRecordResource(loadCards, String(user.id));
  // 역량 API는 기존 프로젝트 데이터 로더가 이미 조회하므로 그 결과를 공유한다.
  const competencyItems = projectData.competencyItems;
  const competencies = competencyItems.map((item) => item.name);
  const initialCompetency = competencies.find((name) => name === requestedCompetency);
  const cards = cardList.data?.cards.map(cardView) ?? [];
  const initialCardId = cards.find(({ id }) => id === requestedCardId)?.id;
  const initialHighlightedCardId = cards.find(({ id }) => id === requestedHighlightId)?.id;
  // 다른 화면에서 카드로 이동해 오면 스토리 카드 탭으로 연다.
  const activeTab =
    requestedTab === "cards" || initialCardId || initialHighlightedCardId || initialCompetency
      ? "cards"
      : "footprints";
  // cacheComponents가 켜져 있으면 다른 페이지에 다녀와도 상태가 유지된다.
  // 스티커나 카드를 눌러 새로 들어온 경우에는 주소 값을 다시 읽도록 key로 초기화하고,
  // 뒤로 가기로 돌아온 경우에는 bfcacheId가 그대로라 보던 상태가 유지된다.
  const { bfcacheId } = useRouter();

  return (
    <>
      <MyRecordTabs activeTab={activeTab} storyCardCount={cardList.data?.totalCount ?? "…"} />
      {activeTab === "footprints" && !footprints.data && <RecordRequestStatus resource={footprints} />}
      {activeTab === "footprints" && footprints.data && (
        <FootprintsPanel
          key={bfcacheId}
          sections={footprintSections}
          weeks={footprints.data.weeks}
          initialWeek={week ?? footprints.data.currentWeek}
        />
      )}
      {activeTab === "cards" && !cardList.data && <RecordRequestStatus resource={cardList} />}
      {activeTab === "cards" && cardList.data && (
        <StoryCardsPanel
          key={initialCardId || initialHighlightedCardId || initialCompetency ? bfcacheId : "story-cards"}
          cards={cards}
          competencies={competencies}
          competencyItems={competencyItems}
          userId={user.id}
          week={week}
          initialCardId={initialCardId}
          initialHighlightedCardId={initialHighlightedCardId}
          initialCompetency={initialCompetency}
          onDeleteCard={deleteStoryCard}
          onUpdateCard={updateStoryCard}
        />
      )}
    </>
  );
}
