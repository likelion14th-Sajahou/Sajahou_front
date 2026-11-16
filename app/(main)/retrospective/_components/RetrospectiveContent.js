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

// 모바일은 Figma의 358 × 299 카드 기준으로 가장자리에 작은 별을 배치한다.
// 아래 별은 카드 높이가 달라져도 버튼 옆·아래에 머물도록 아래쪽에 고정한다. 데스크톱 배치는 유지한다.
const START_CARD_STARS = [
  { src: "star-03", width: 30, height: 30, className: "left-[4.5%] top-[9%] w-[19px] -rotate-12 lg:left-[8.2%] lg:top-[34px] lg:w-[30px]" },
  { src: "star-13", width: 21, height: 21, className: "right-[12.3%] top-[2%] w-3 rotate-18 min-[390px]:top-[4%] lg:top-12 lg:left-[87.5%] lg:right-auto lg:w-[21px]" },
  { src: "star-04", width: 24, height: 24, className: "left-[3%] top-[58.2%] w-[11px] rotate-10 lg:left-[16.2%] lg:top-[90px] lg:w-6" },
  { src: "star-07", width: 20, height: 20, className: "left-[10.6%] bottom-[11.4%] w-4 rotate-24 lg:left-[10.7%] lg:top-[234px] lg:bottom-auto lg:w-5" },
  { src: "star-05", width: 28, height: 28, className: "right-[5%] bottom-[9%] w-[25px] -rotate-16 min-[390px]:bottom-[22.7%] lg:left-[84.3%] lg:top-[220px] lg:right-auto lg:bottom-auto lg:w-7" },
];

function StartCardStars() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {START_CARD_STARS.map(({ src, width, height, className }) => (
        <Image key={src} src={`/images/stars/${src}.png`} alt="" width={width} height={height} className={`absolute h-auto lg:rotate-0 ${className}`} />
      ))}
    </div>
  );
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
      <RetrospectiveSteps />

      {/* Figma: 진행 단계는 본문 전체 폭, 카드 줄은 제목과 같은 896px(시작 카드 560 + 16 + 마감일 카드 320)로 가운데에 둔다. */}
      <div className="mx-auto grid max-w-[896px] grid-cols-1 items-start gap-4 min-[901px]:grid-cols-[minmax(0,1fr)_320px]">
        {/* 회고 시작 카드(Figma '세션 회고 시작 카드'): 진한 바탕, 별 장식, 구름 캐릭터 말풍선. 과제 회고도 같은 모양이다.
            테두리는 바탕과 같은 색의 울퉁불퉁한 선(DrawnBorder)이라 가장자리가 손그림처럼 보인다. 선이 카드 밖으로 반쯤 나가므로 overflow를 자르지 않는다. */}
        <section aria-labelledby="start-title" className="relative flex flex-col items-center gap-4 rounded-[24px] bg-ink-900 p-6 text-center">
          <DrawnBorder />
          <StartCardStars />
          <h2 id="start-title" className="relative min-w-0 max-w-full px-4 font-display text-[22px] leading-[35.2px] tracking-[-0.44px] text-balance text-white min-[390px]:px-0">
            {isAssignment ? "과제 회고를 시작해요" : "이번 주 세션 회고를 시작해요"}
          </h2>
          <div className="relative flex items-end gap-3">
            <Image src="/images/characters/cloud-small.png" alt="" width={56} height={47} className="shrink-0" />
            <div className="relative min-w-0 rounded-[22px] rounded-bl-[6px] bg-canvas px-4 py-3 text-left text-[16px] leading-[27.55px] tracking-[-0.19px] text-ink sm:px-6 sm:py-4">
              <DrawnBorder color="#e4e2dd" />
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
