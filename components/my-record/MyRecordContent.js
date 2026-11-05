import MyRecordTabs from "./MyRecordTabs";

export default async function MyRecordContent({ searchParams, storyCardCount }) {
  const { tab } = await searchParams;
  const activeTab = tab === "cards" ? "cards" : "footprints";

  return <MyRecordTabs activeTab={activeTab} storyCardCount={storyCardCount} />;
}
