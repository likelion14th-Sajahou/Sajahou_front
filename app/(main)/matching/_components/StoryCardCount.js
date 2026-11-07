"use client";

import { useMockData } from "@/components/layout/MockDataProvider";

export default function StoryCardCount() {
  const { storyCards } = useMockData();

  return <p className="text-[26px] leading-[1.2]">{storyCards.length}</p>;
}
