"use client";

import { useMockData } from "@/components/layout/MockDataProvider";
import {
  getEarnedStickers,
  getRecentRetrospectives,
  HOME_PLACEHOLDER_STICKERS,
  HOME_WEEK_STATUS,
} from "@/lib/mock/home";
import { MOCK_WEEK } from "@/lib/mock/week";
import { selectBoardStickers } from "@/lib/selectBoardStickers";
import HomeHero from "./HomeHero";
import MatchingPromoCard from "./MatchingPromoCard";
import ProjectsCard from "./ProjectsCard";
import RecentRetrospectives from "./RecentRetrospectives";
import StickerBoard from "./StickerBoard";

// 이번 주 회고를 완료했거나 휴회한 주에는 스티커 보드의 + 자리를 숨긴다.
const STATUSES_WITHOUT_CURRENT_SLOT = ["done", "rest"];

export default function HomeContent() {
  const { user, footprintWeeks, storyCards, weekStatus } = useMockData();
  const homeStatus = HOME_WEEK_STATUS[weekStatus];
  const earnedStickers = getEarnedStickers(footprintWeeks);
  // 이미 받은 스티커의 예정 자리와, 이번 주가 끝났을 때의 + 자리는 보여 주지 않는다.
  const visiblePlaceholders = HOME_PLACEHOLDER_STICKERS.filter(
    ({ kind, week }) =>
      !earnedStickers.some((sticker) => sticker.week === week) &&
      (kind !== "current" || !STATUSES_WITHOUT_CURRENT_SLOT.includes(homeStatus)),
  );

  return (
    <>
      <HomeHero userName={user.name} week={MOCK_WEEK.week} weekStatus={homeStatus} />
      <main className="mx-auto w-full max-w-[1120px] px-4 pt-2 pb-20">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.75fr_1fr]">
          <StickerBoard
            count={earnedStickers.length}
            stickers={[...selectBoardStickers(earnedStickers), ...visiblePlaceholders].toSorted(
              (a, b) => a.week - b.week,
            )}
          />
          <div className="grid gap-4 md:grid-cols-2 lg:flex lg:flex-col">
            <ProjectsCard />
            <MatchingPromoCard />
          </div>
        </div>
        <RecentRetrospectives items={getRecentRetrospectives(storyCards)} />
      </main>
    </>
  );
}
