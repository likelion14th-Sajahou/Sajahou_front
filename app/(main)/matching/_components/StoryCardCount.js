"use client";

import { useMockData } from "@/components/layout/MockDataProvider";
import { useAuth } from "@/components/layout/AuthProvider";

export default function StoryCardCount() {
  const { isAuthenticated } = useAuth();
  const { storyCards } = useMockData();

  return <p className="text-[26px] leading-[1.2]">{isAuthenticated ? storyCards.length : "—"}</p>;
}
