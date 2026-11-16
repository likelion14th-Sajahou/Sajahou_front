import MarkedTitle from "@/components/ui/MarkedTitle";
import { AUTH_PART_LABELS } from "@/lib/authConfig";

const PARTS = ["PLAN_DESIGN", "FRONTEND", "BACKEND"];

// 회원가입: 세 파트 중 하나를 고른다(S-04). 고른 칩만 진한 바탕 + 흰 글씨.
// 내 정보 수정 팝업처럼 '파트'는 기본 정보와 따로 된 형광펜 제목 구역이다(MarkedSection과 같은 제목·간격).
// 내 정보 수정 팝업은 파트를 바꿀 수 없어서 이 칸 대신 내 파트만 보여 준다(ProfileModal).
export default function PartField({ id, value, onChange, error }) {
  return (
    // 라디오 묶음이라 fieldset을 쓰고, 보이는 제목(h2)을 묶음 이름으로 쓴다.
    <fieldset className="flex min-w-0 flex-col gap-4" aria-labelledby={`${id}-title`} aria-describedby={error ? `${id}-error` : undefined} aria-invalid={error ? true : undefined}>
      <MarkedTitle as="h2" id={`${id}-title`}>파트</MarkedTitle>
      <div>
        <div className="flex flex-wrap gap-2">
          {PARTS.map((part) => (
            <label key={part} className="min-w-fit flex-1 cursor-pointer">
              <input type="radio" name="part" value={part} checked={value === part} onChange={onChange} className="peer sr-only" />
              <span className="font-display flex items-center justify-center rounded-[14px] border border-line bg-white px-2 py-2.5 text-center text-body-sm leading-5 whitespace-nowrap text-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink">
                {AUTH_PART_LABELS[part]}
              </span>
            </label>
          ))}
        </div>
        {error && <p id={`${id}-error`} className="mt-2 text-caption leading-5 text-error">{error}</p>}
      </div>
    </fieldset>
  );
}
