import Image from "next/image";

const STEPS = ["시작", "자료", "AI 질문", "검토", "저장"];

// 단계 배지(Figma 'Step Badge'): 단계마다 다른 별·꽃 모양. 남은 단계는 회색 모양 그림, 끝낸 단계는 같은 모양을 마스크로 써서 노랗게 칠한다(Figma와 같은 방식).
// 모양 크기는 Figma 배지 안 비율 그대로다(가로 40 기준). 1·4단계 회색은 Figma에서 투명도 90%다.
const BADGES = [
  { height: 41, faded: true },
  { height: 40, faded: false },
  { height: 44, faded: false },
  { height: 41, faded: true },
  { height: 38, faded: false },
];

function StepBadge({ index, done }) {
  const { height, faded } = BADGES[index];
  const src = `/images/retrospective/step-${index + 1}.png`;

  return (
    <span className="relative flex size-11 items-center justify-center">
      {done ? (
        <span
          aria-hidden="true"
          className="block w-10 bg-yellow-400 [mask-repeat:no-repeat] [mask-size:100%_100%]"
          style={{ height, maskImage: `url(${src})` }}
        />
      ) : (
        <Image src={src} alt="" width={40} height={height} className={faded ? "opacity-90" : ""} />
      )}
      <span className={`absolute text-body leading-6 ${done ? "text-ink-muted" : "text-ink-500"}`}>{index + 1}</span>
    </span>
  );
}

// 회고 5단계 진행 표시(R-02, Figma '회고 진행 단계').
// 끝낸 단계: 노란 배지 + 번호, 지금 단계: 구름 캐릭터 + 흔들림 + '지금 여기!', 남은 단계: 회색 배지 + 번호.
// 지나온 길은 진한 점선, 남은 길은 연한 점선이다.
// className으로 위 간격을 바꿀 수 있다(시작 화면은 Figma대로 제목과 38px).
export default function RetrospectiveSteps({ currentStep = 0, className = "mt-6" }) {
  return (
    <div className={`relative pt-8 ${className}`}>
      {/* 첫 단계 가운데(10%)부터 마지막 단계 가운데(90%)까지 연한 점선, 지금 단계까지는 진한 점선을 덧그린다. */}
      <span aria-hidden="true" className="absolute top-[59px] right-[10%] left-[10%] border-t-[3px] border-dashed border-locked" />
      {currentStep > 0 && (
        <span aria-hidden="true" className="absolute top-[59px] left-[10%] border-t-[3px] border-dashed border-ink" style={{ width: `${currentStep * 20}%` }} />
      )}
      <ol aria-label="회고 단계" className="relative grid grid-cols-5">
        {STEPS.map((label, index) => {
          const isCurrent = index === currentStep;
          return (
            <li
              key={label}
              aria-current={isCurrent ? "step" : undefined}
              className="relative flex min-w-0 flex-col items-center gap-1"
            >
              <span className="flex size-14 items-center justify-center">
                {isCurrent ? (
                  <Image src="/images/characters/cloud-small.png" alt="" width={56} height={47} className="step-wobble" />
                ) : (
                  <StepBadge index={index} done={index < currentStep} />
                )}
              </span>
              <span className={`text-caption leading-[22.4px] sm:text-body-sm ${isCurrent ? "font-bold text-ink" : "text-ink"}`}>{label}</span>
              {isCurrent && (
                <span className="absolute -top-[30px] left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-ink-muted px-2 py-1 text-[11px] leading-[17.6px] text-white after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-x-4 after:border-t-4 after:border-x-transparent after:border-t-ink-muted sm:block">
                  지금 여기!
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
