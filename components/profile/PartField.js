import { AUTH_PART_LABELS } from "@/lib/authConfig";

const PARTS = ["PLAN_DESIGN", "FRONTEND", "BACKEND"];

// '파트' 칸 이름은 이름·학번 등 다른 칸 이름과 같은 모양이다(Figma '[디] 00-c' 11/13 수정: 위쪽 구분선 없음).
const LABEL_CLASS = "mb-2 font-display text-label leading-5 text-ink";

// 회원가입: 세 파트 중 하나를 고른다(S-04). 고른 칩만 진한 바탕 + 흰 글씨.
// 내 정보 수정 팝업은 파트를 바꿀 수 없어서 이 칸 대신 내 파트만 보여 준다(ProfileModal).
export default function PartField({ id, value, onChange, error }) {
  return (
    // 라디오 묶음이라 fieldset을 쓴다. 기본 정보 구역 바로 아래에 이어 붙는다.
    <fieldset className="min-w-0 pb-6" aria-labelledby={`${id}-title`} aria-describedby={error ? `${id}-error` : undefined} aria-invalid={error ? true : undefined}>
      <legend className="sr-only">파트</legend>
      <p id={`${id}-title`} className={LABEL_CLASS}>파트</p>
      <div className="grid grid-cols-3 gap-2">
        {PARTS.map((part) => (
          <label key={part} className="cursor-pointer">
            <input type="radio" name="part" value={part} checked={value === part} onChange={onChange} className="peer sr-only" />
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
