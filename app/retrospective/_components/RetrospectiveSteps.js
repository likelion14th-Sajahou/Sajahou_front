import ShapeCharacter from "@/components/ui/ShapeCharacter";

const STEPS = [
  { label: "시작", shape: "circle", size: 56, color: "blue", face: "smile" },
  { label: "자료", shape: "square", size: 44, color: "muted", face: "none" },
  { label: "AI 질문", shape: "sunFine", size: 44, color: "muted", face: "none" },
  { label: "검토", shape: "triangle", size: 44, color: "muted", face: "none" },
  { label: "저장", shape: "semicircle", size: 44, color: "muted", face: "none" },
];

export default function RetrospectiveSteps({ currentStep = 0 }) {
  return (
    <ol aria-label="회고 단계" className="mt-6 grid grid-cols-5 pt-1 sm:pt-9">
      {STEPS.map(({ label, shape, size, color, face }, index) => (
        <li
          key={label}
          aria-current={index === currentStep ? "step" : undefined}
          className="relative flex min-w-0 flex-col items-center gap-2 text-caption sm:text-body-sm"
        >
          {index > 0 && (
            <span aria-hidden="true" className={`absolute top-[21px] right-1/2 w-full border-t-[3px] sm:top-[27px] ${index <= currentStep ? "border-solid border-ink" : "border-dashed border-[#cfcabf]"}`} />
          )}
          <div className="relative z-10 flex size-11 items-center justify-center sm:size-14">
            <ShapeCharacter
              shape={shape}
              size={index === currentStep ? 56 : index < currentStep ? 46 : size === 56 ? 44 : size}
              color={index <= currentStep ? (index === 0 ? "blue" : index === 2 ? "peach" : index === 3 ? "coral" : "yellow") : color}
              face={index <= currentStep ? "smile" : face}
              cropped
              className={`relative max-w-none shrink-0 ${index === currentStep ? "max-sm:translate-x-1.5 max-sm:translate-y-1.5" : index > currentStep ? "opacity-90" : ""}`}
            />
            {index === currentStep ? (
              <span className="absolute -top-[30px] left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-[9px] py-[3px] text-[11px] leading-[18px] text-white after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-x-4 after:border-t-4 after:border-x-transparent after:border-t-ink sm:block">
                지금 여기!
              </span>
            ) : index < currentStep ? (
              <span aria-hidden="true" className="absolute -top-0.5 right-[-2px] flex size-5 items-center justify-center rounded-full bg-ink text-[11px] text-white shadow-[0_0_0_2.5px_var(--color-canvas)]">
                ✓
              </span>
            ) : (
              <span aria-hidden="true" className={`absolute text-body text-[#9a958c] ${index > 2 ? "top-4 sm:top-[22px]" : "top-2.5 sm:top-4"}`}>
                {index + 1}
              </span>
            )}
          </div>
          <span className={index <= currentStep ? "text-ink" : "text-ink-subtle"}>{label}</span>
        </li>
      ))}
    </ol>
  );
}
