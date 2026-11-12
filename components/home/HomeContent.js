"use client";

import { homeRecentCards, homeStickers } from "@/lib/homeViewModel";
import HomeHero from "./HomeHero";
import MatchingPromoCard from "./MatchingPromoCard";
import ProjectsCard from "./ProjectsCard";
import RecentRetrospectives from "./RecentRetrospectives";
import StickerBoard from "./StickerBoard";
import { useAuth } from "@/components/layout/AuthProvider";
import Toast from "@/components/ui/Toast";
import useHomeData from "./useHomeData";
import RecordRequestStatus from "@/components/my-record/RecordRequestStatus";
import ScrollReveal from "./ScrollReveal";

export default function HomeContent() {
  const { signupWelcome, clearSignupWelcome } = useAuth();
  const home = useHomeData();
  const homeStatus = home.data?.sessionRetrospective.state;

  if (!home.data) return <main className="mx-auto max-w-[1120px] px-4 py-8"><RecordRequestStatus resource={home}>홈을 불러오는 중이에요.</RecordRequestStatus></main>;

  return (
    <>
      <HomeHero userName={home.data.user.name} week={home.data.currentWeek.weekNumber} weekStatus={homeStatus} />
      {/* Figma: 검은 배경 아래 여백 43px + 본문 상단 패딩 8px. */}
      <main className="mx-auto w-full max-w-[1120px] px-4 pt-[51px] pb-20">
        <ScrollReveal className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,680fr)_minmax(0,392fr)]">
          <StickerBoard
            count={home.data.stickers.totalCount}
            stickers={homeStickers(home.data.footprints)}
          />
          <div className="grid gap-4 md:grid-cols-2 md:items-start lg:flex lg:flex-col lg:items-stretch">
            <MatchingPromoCard />
            <ProjectsCard inProgressProjects={home.data.inProgressProjects} doneProjects={home.data.doneProjects} />
          </div>
        </ScrollReveal>
        <RecentRetrospectives items={homeRecentCards(home.data.recentCards)} />
      </main>
      <Toast toast={signupWelcome} onDismiss={clearSignupWelcome} />
    </>
  );
}
