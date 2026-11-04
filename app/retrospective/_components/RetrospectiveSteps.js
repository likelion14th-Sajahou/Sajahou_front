import ShapeCharacter from "@/components/ui/ShapeCharacter";

const STEPS = [
  { label: "시작", shape: "circle", size: 56, color: "blue", face: "smile" },
  { label: "자료", shape: "square", size: 44, color: "muted", face: "none" },
  { label: "AI 질문", shape: "sunFine", size: 44, color: "muted", face: "none" },
  { label: "검토", shape: "triangle", size: 44, color: "muted", face: "none" },
  { label: "저장", shape: "semicircle", size: 44, color: "muted", face: "none" },
];

export default function RetrospectiveSteps() {
  return (
    <ol aria-label="회고 단계" className="mt-6 grid grid-cols-5 pt-1 sm:pt-9">
      {STEPS.map(({ label, shape, size, color, face }, index) => (
        <li
          key={label}
          aria-current={index === 0 ? "step" : undefined}
          className="relative flex min-w-0 flex-col items-center gap-2 text-caption sm:text-body-sm"
        >
          {index > 0 && (
            <span aria-hidden="true" className="absolute top-[21px] right-1/2 w-full border-t-[3px] border-dashed border-[#cfcabf] sm:top-[27px]" />
          )}
          <div className="relative z-10 flex size-11 items-center justify-center sm:size-14">
            <ShapeCharacter
              shape={shape}
              size={size}
              color={color}
              face={face}
              cropped
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
