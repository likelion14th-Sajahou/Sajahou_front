import { AUTH_PART_LABELS } from "@/lib/authConfig";

const PARTS = ["PLAN_DESIGN", "FRONTEND", "BACKEND"];

export default function PartField({ id, value, onChange, error, readOnly = false }) {
  return (
    <fieldset disabled={readOnly} className="min-w-0 border-t border-line pt-[18px] pb-5" aria-labelledby={`${id}-title`} aria-describedby={error ? `${id}-error` : undefined} aria-invalid={error ? true : undefined}>
      <legend className="sr-only">파트{readOnly ? " (변경 불가)" : ""}</legend>
      <p id={`${id}-title`} className="mb-[14px] text-body leading-6 tracking-[-0.3px]">파트{readOnly && <span className="sr-only"> (변경 불가)</span>}</p>
      {/* 파트 칩(Figma 'Part Chip'): 고른 파트만 진한 바탕 + 흰 글씨 */}
      <div className="grid grid-cols-3 gap-2">
        {PARTS.map((part) => (
          <label key={part} className={readOnly ? "cursor-default" : "cursor-pointer"}>
            <input type="radio" name="part" value={part} checked={value === part} onChange={onChange} readOnly={readOnly} className="peer sr-only" />
            <span className="flex items-center justify-center rounded-[14px] border border-line bg-white px-2 py-2.5 text-center text-body-sm leading-5 whitespace-nowrap text-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink">
              {AUTH_PART_LABELS[part]}
            </span>
          </label>
        ))}
      </div>
      {error && <p id={`${id}-error`} className="mt-2 text-caption leading-5 text-error">{error}</p>}
    </fieldset>
  );
}
