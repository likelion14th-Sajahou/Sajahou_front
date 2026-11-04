import HomeHero from "@/components/home/HomeHero";
import MatchingPromoCard from "@/components/home/MatchingPromoCard";
import ProjectsCard from "@/components/home/ProjectsCard";
import RecentRetrospectives from "@/components/home/RecentRetrospectives";
import StickerBoard from "@/components/home/StickerBoard";
import { MOCK_HOME } from "@/lib/mock/home";
import { MOCK_USER } from "@/lib/mock/user";

export default function HomePage() {
  const { week, weekStatus, stickerCount, stickers, projects, recentRetrospectives } = MOCK_HOME;
  const visibleStickers =
    weekStatus === "rest"
      ? stickers.filter(({ kind }) => kind !== "current")
      : stickers;

  return (
    <>
      <HomeHero userName={MOCK_USER.name} week={week} weekStatus={weekStatus} />
      <main className="mx-auto w-full max-w-[1120px] px-4 pt-2 pb-20">
        <div className="grid grid-cols-[1.75fr_1fr] gap-4">
          <StickerBoard count={stickerCount} stickers={visibleStickers} />
          <div className="flex flex-col gap-4">
            <ProjectsCard initialProjects={projects} />
            <MatchingPromoCard />
          </div>
        </div>
        <RecentRetrospectives items={recentRetrospectives} />
      </main>
    </>
  );
}
