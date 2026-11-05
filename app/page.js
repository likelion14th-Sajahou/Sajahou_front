import HomeHero from "@/components/home/HomeHero";
import MatchingPromoCard from "@/components/home/MatchingPromoCard";
import ProjectsCard from "@/components/home/ProjectsCard";
import RecentRetrospectives from "@/components/home/RecentRetrospectives";
import StickerBoard from "@/components/home/StickerBoard";
import { MOCK_HOME } from "@/lib/mock/home";
import { MOCK_USER } from "@/lib/mock/user";

// 이번 주 회고를 완료했거나 휴회한 주에는 스티커 보드의 + 자리를 숨긴다.
const STATUSES_WITHOUT_CURRENT_SLOT = ["done", "rest"];

export default function HomePage() {
  const { week, weekStatus, stickerCount, stickers, projects, recentRetrospectives } = MOCK_HOME;
  const visibleStickers =
    STATUSES_WITHOUT_CURRENT_SLOT.includes(weekStatus)
      ? stickers.filter(({ kind }) => kind !== "current")
      : stickers;

  return (
    <>
      <HomeHero userName={MOCK_USER.name} week={week} weekStatus={weekStatus} />
      <main className="mx-auto w-full max-w-[1120px] px-4 pt-2 pb-20">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.75fr_1fr]">
          <StickerBoard count={stickerCount} stickers={visibleStickers} />
          <div className="grid gap-4 md:grid-cols-2 lg:flex lg:flex-col">
            <ProjectsCard initialProjects={projects} />
            <MatchingPromoCard />
          </div>
        </div>
        <RecentRetrospectives items={recentRetrospectives} />
      </main>
    </>
  );
}
