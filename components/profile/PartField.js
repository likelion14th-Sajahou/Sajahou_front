import ShapeCharacter from "@/components/ui/ShapeCharacter";
import { AUTH_PART_LABELS } from "@/lib/authConfig";

const PARTS = [
  { value: "PLAN_DESIGN", shape: "sunFine", color: "yellow" },
  { value: "FRONTEND", shape: "circle", color: "blue" },
  { value: "BACKEND", shape: "pentagon", color: "coral" },
];

export default function PartField({ id, value, onChange, error, readOnly = false }) {
  return (
    <fieldset disabled={readOnly} className="min-w-0 border-t border-line pt-[18px] pb-5" aria-labelledby={`${id}-title`} aria-describedby={error ? `${id}-error` : undefined} aria-invalid={error ? true : undefined}>
      <legend className="sr-only">파트{readOnly ? " (변경 불가)" : ""}</legend>
      <p id={`${id}-title`} className="mb-[14px] text-body leading-6 tracking-[-0.3px]">파트{readOnly && <span className="sr-only"> (변경 불가)</span>}</p>
      <div className="grid grid-cols-3 gap-[10px]">
        {PARTS.map(({ value: part, shape, color }) => (
          <label key={part} className={`group relative ${readOnly ? "cursor-default" : "cursor-pointer"}`}>
            <input type="radio" name="part" value={part} checked={value === part} onChange={onChange} readOnly={readOnly} className="peer sr-only" />
            <span className="flex min-h-[100px] flex-col items-center gap-1.5 rounded-[18px] border border-line px-1 py-[14px] peer-checked:border-ink peer-checked:bg-selection peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink sm:px-[14px]">
              <span aria-hidden="true" className="relative block size-10 shrink-0">
                <ShapeCharacter shape={shape} color={value === part ? color : "muted"} size={40} />
              </span>
              <span className="text-center text-label leading-6 whitespace-nowrap sm:text-body">{AUTH_PART_LABELS[part]}</span>
            </span>
          </label>
        ))}
      </div>
      {error && <p id={`${id}-error`} className="mt-[14px] pt-0.5 text-label leading-[20.8px] text-error">{error}</p>}
    </fieldset>
  );
}
