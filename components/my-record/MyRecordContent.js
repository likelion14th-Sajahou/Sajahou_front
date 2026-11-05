import MyRecordView from "./MyRecordView";

export default async function MyRecordContent({ searchParams, record }) {
  const { tab, week, card } = await searchParams;
  const requestedWeek = record.footprintWeeks.find((item) => item.week === Number(week));

  return (
    <MyRecordView
      record={record}
      activeTab={tab === "cards" ? "cards" : "footprints"}
      week={requestedWeek?.week}
      initialCardId={card}
    />
  );
}
