import MyRecordView from "./MyRecordView";

export default async function MyRecordContent({ searchParams }) {
  const { tab, week, card, highlight, tag } = await searchParams;
  const requestedWeek = Number(week);

  return (
    <MyRecordView
      requestedTab={tab}
      week={Number.isInteger(requestedWeek) && requestedWeek >= 1 && requestedWeek <= 39 ? requestedWeek : undefined}
      requestedCardId={card}
      requestedHighlightId={highlight}
      requestedCompetency={tag}
    />
  );
}
