import MyRecordView from "./MyRecordView";

export default async function MyRecordContent({ searchParams, record }) {
  const { tab, week, card, highlight, tag } = await searchParams;
  const requestedWeek = record.footprintWeeks.find((item) => item.week === Number(week));
  const requestedCompetency = record.competencies.find((name) => name === tag);

  return (
    <MyRecordView
      record={record}
      requestedTab={tab}
      week={requestedWeek?.week}
      requestedCardId={card}
      requestedHighlightId={highlight}
      initialCompetency={requestedCompetency}
    />
  );
}
