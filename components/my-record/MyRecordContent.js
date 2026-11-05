import MyRecordView from "./MyRecordView";

export default async function MyRecordContent({ searchParams, record }) {
  const { tab, week, card } = await searchParams;
  const requestedWeek = record.footprintWeeks.find((item) => item.week === Number(week));
  // 다른 화면에서 카드로 이동해 오면 스토리 카드 탭으로 연다.
  const requestedCard = record.storyCards.find(({ id }) => id === card);

  return (
    <MyRecordView
      record={record}
      activeTab={tab === "cards" || requestedCard ? "cards" : "footprints"}
      week={requestedWeek?.week}
      initialCardId={requestedCard?.id}
    />
  );
}
