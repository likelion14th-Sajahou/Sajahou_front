import Image from "next/image";
import RetrospectiveSteps from "./RetrospectiveSteps";
import StartActions from "./StartActions";
import PausedRetrospective from "./PausedRetrospective";
import MaterialsContent from "./MaterialsContent";
import AiQuestionsContent from "./AiQuestionsContent";
import ReviewContent from "./ReviewContent";
import CompleteContent from "./CompleteContent";
import RetrospectiveWeekGate from "./RetrospectiveWeekGate";
import RetrospectiveDeadlines from "./RetrospectiveDeadlines";

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
      <RetrospectiveSteps />

      <div className={`mt-7 grid items-start gap-5 ${isAssignment ? "grid-cols-[minmax(0,1fr)_320px]" : "grid-cols-1 min-[901px]:grid-cols-[minmax(0,1fr)_320px]"}`}>
        {/* 회고 시작 카드(Figma '세션 회고 시작 카드'): 진한 바탕, 별 장식, 구름 캐릭터 말풍선. 과제 회고도 같은 모양이다. */}
        <section aria-labelledby="start-title" className="relative flex flex-col items-center gap-4 overflow-hidden rounded-[24px] bg-ink-900 p-6 text-center">
          <StartCardStars />
          <h2 id="start-title" className="relative font-display text-[22px] leading-[35.2px] tracking-[-0.44px] text-balance text-white">
            {isAssignment ? "과제 회고를 시작해요" : "이번 주 세션 회고를 시작해요"}
          </h2>
          <div className="relative flex items-end gap-3">
            <Image src="/images/characters/cloud-small.png" alt="" width={56} height={47} className="shrink-0" />
            <div className="min-w-0 rounded-[22px] rounded-bl-[6px] border-4 border-locked bg-canvas px-4 py-3 text-left text-[16px] leading-[1.45] tracking-[-0.19px] text-ink sm:px-6 sm:py-4 sm:text-[19px]">
              <p>{isAssignment ? "막혔던 그 순간이" : "지금은 조금 귀찮아도,"}</p>
              <p>{isAssignment ? "면접에서 제일 할 말 많은 이야기가 돼요." : "쌓이면 나만의 큰 자산이 돼요!"}</p>
            </div>
          </div>
          <StartActions isAssignment={isAssignment} />
        </section>

        {/* 마감일 카드(Figma '마감일 카드'): 노란 굵은 테두리, 별 장식 */}
        <aside aria-labelledby="deadline-title" className="rounded-[24px] border-4 border-yellow-400 bg-white p-6">
          <div className="relative flex items-center justify-between border-b border-ink pb-3">
            <h2 id="deadline-title" className="font-display text-[18px] leading-[28.8px] tracking-[-0.18px] text-ink">마감일</h2>
            <span aria-hidden="true" className="relative mr-1 size-5">
              <Image src="/images/stars/star-03.png" alt="" width={20} height={20} />
              <Image src="/images/stars/star-03.png" alt="" width={11} height={11} className="absolute -top-[7px] -left-2" />
            </span>
          </div>
          <RetrospectiveDeadlines />
        </aside>
      </div>
    </RetrospectiveWeekGate>
  );
}
