import Image from "next/image";
import DrawnBorder from "@/components/ui/DrawnBorder";
import RetrospectiveSteps from "./RetrospectiveSteps";
import StartActions from "./StartActions";
import PausedRetrospective from "./PausedRetrospective";
import MaterialsContent from "./MaterialsContent";
import AiQuestionsContent from "./AiQuestionsContent";
import ReviewContent from "./ReviewContent";
import CompleteContent from "./CompleteContent";
import RetrospectiveWeekGate from "./RetrospectiveWeekGate";
import RetrospectiveDeadlines from "./RetrospectiveDeadlines";
import RetroSideCard from "./RetroSideCard";

// 시작 카드의 별 장식(Figma 위치). 가로 위치는 카드 폭(560)에 대한 비율로 둬서 카드 폭이 달라도 비슷한 자리에 놓인다.
const START_CARD_STARS = [
  { src: "star-03", left: "8.2%", top: 34, width: 30, height: 30 },
  { src: "star-13", left: "87.5%", top: 48, width: 21, height: 21 },
  { src: "star-04", left: "16.2%", top: 90, width: 24, height: 24 },
  { src: "star-07", left: "10.7%", top: 234, width: 20, height: 20 },
  { src: "star-05", left: "84.3%", top: 220, width: 28, height: 28 },
];

function StartCardStars() {
  return START_CARD_STARS.map(({ src, left, top, width, height }) => (
    <Image key={src} src={`/images/stars/${src}.png`} alt="" width={width} height={height} className="absolute" style={{ left, top }} />
  ));
}

export default async function RetrospectiveContent({ searchParams }) {
  const { step, type } = await searchParams;
  const isAssignment = type === "assignment";
  const pausedContent = <PausedRetrospective />;
  if (step === "materials") return <MaterialsContent />;
  if (step === "questions") return <AiQuestionsContent />;
  if (step === "review") return <ReviewContent />;
  const completeContent = <CompleteContent />;
  if (step === "complete") return completeContent;

  return (
    <RetrospectiveWeekGate isAssignment={isAssignment} paused={pausedContent} complete={completeContent}>
      <RetrospectiveSteps className="mt-[38px]" />

      {/* Figma: 진행 단계는 본문 전체 폭, 카드 줄은 제목과 같은 896px(시작 카드 560 + 16 + 마감일 카드 320)로 가운데에 둔다. */}
      <div className={`mx-auto mt-10 grid max-w-[896px] items-start gap-4 ${isAssignment ? "grid-cols-[minmax(0,1fr)_320px]" : "grid-cols-1 min-[901px]:grid-cols-[minmax(0,1fr)_320px]"}`}>
        {/* 회고 시작 카드(Figma '세션 회고 시작 카드'): 진한 바탕, 별 장식, 구름 캐릭터 말풍선. 과제 회고도 같은 모양이다.
            테두리는 바탕과 같은 색의 울퉁불퉁한 선(DrawnBorder)이라 가장자리가 손그림처럼 보인다. 선이 카드 밖으로 반쯤 나가므로 overflow를 자르지 않는다. */}
        <section aria-labelledby="start-title" className="relative flex flex-col items-center gap-4 rounded-[24px] bg-ink-900 p-6 text-center">
          <DrawnBorder variant="start-card" />
          <StartCardStars />
          <h2 id="start-title" className="relative font-display text-[22px] leading-[35.2px] tracking-[-0.44px] text-balance text-white">
            {isAssignment ? "과제 회고를 시작해요" : "이번 주 세션 회고를 시작해요"}
          </h2>
          <div className="relative flex items-end gap-3">
            <Image src="/images/characters/cloud-small.png" alt="" width={56} height={47} className="shrink-0" />
            <div className="relative min-w-0 rounded-[22px] rounded-bl-[6px] bg-canvas px-4 py-3 text-left text-[16px] leading-[27.55px] tracking-[-0.19px] text-ink sm:px-6 sm:py-4">
              <DrawnBorder variant="bubble" />
              <p>{isAssignment ? "막혔던 그 순간이" : "지금은 조금 귀찮아도,"}</p>
              <p>{isAssignment ? "면접에서 제일 할 말 많은 이야기가 돼요." : "쌓이면 나만의 큰 자산이 돼요!"}</p>
            </div>
          </div>
          <StartActions isAssignment={isAssignment} />
        </section>

        {/* 마감일 카드(Figma '마감일 카드'): 노란 굵은 테두리, 별 장식 */}
        <RetroSideCard titleId="deadline-title" title="마감일" action={
          <span aria-hidden="true" className="relative mr-1 size-5">
            <Image src="/images/stars/star-03.png" alt="" width={20} height={20} />
            <Image src="/images/stars/star-03.png" alt="" width={11} height={11} className="absolute -top-[7px] -left-2" />
          </span>
        }>
          <RetrospectiveDeadlines />
        </RetroSideCard>
      </div>
    </RetrospectiveWeekGate>
  );
}
