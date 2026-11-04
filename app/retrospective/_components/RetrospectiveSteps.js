import Image from "next/image";

const STEPS = [
  { label: "시작", asset: "643bd", width: 51.52, height: 51.52 },
  { label: "자료", asset: "2562d", width: 36.96, height: 36.96 },
  { label: "AI 질문", asset: "c8b0a", width: 40.744, height: 41.36 },
  { label: "검토", asset: "340a6", width: 38.72, height: 36.08 },
  { label: "저장", asset: "d197a", width: 38.72, height: 19.36 },
];

export default function RetrospectiveSteps() {
  return (
    <ol aria-label="회고 단계" className="mt-6 grid grid-cols-5 pt-1 sm:pt-9">
      {STEPS.map(({ label, asset, width, height }, index) => (
        <li
          key={label}
          aria-current={index === 0 ? "step" : undefined}
          className="relative flex min-w-0 flex-col items-center gap-2 text-caption sm:text-body-sm"
        >
          {index > 0 && (
            <span aria-hidden="true" className="absolute top-[21px] right-1/2 w-full border-t-[3px] border-dashed border-[#cfcabf] sm:top-[27px]" />
          )}
          <div className="relative z-10 flex size-11 items-center justify-center sm:size-14">
            <Image
              src={`/images/retrospective/${asset}.svg`}
              alt=""
              width={width}
              height={height}
              className={`relative max-w-none shrink-0 ${index === 0 ? "max-sm:translate-x-1.5 max-sm:translate-y-1.5" : "opacity-90"}`}
            />
            {index === 0 ? (
              <span className="absolute -top-[30px] left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-[9px] py-[3px] text-[11px] leading-[18px] text-white after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-x-4 after:border-t-4 after:border-x-transparent after:border-t-ink sm:block">
                지금 여기!
              </span>
            ) : (
              <span aria-hidden="true" className={`absolute text-body text-[#9a958c] ${index > 2 ? "top-4 sm:top-[22px]" : "top-2.5 sm:top-4"}`}>
                {index + 1}
              </span>
            )}
          </div>
          <span className={index === 0 ? "text-ink" : "text-ink-subtle"}>{label}</span>
        </li>
      ))}
    </ol>
  );
}
