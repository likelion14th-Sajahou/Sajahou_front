import ChoiceChip from "@/components/ui/ChoiceChip";
import MarkedTitle from "@/components/ui/MarkedTitle";
import { AUTH_PART_LABELS } from "@/lib/authConfig";

const PARTS = ["PLAN_DESIGN", "FRONTEND", "BACKEND"];

// 회원가입: 세 파트 중 하나를 고른다(S-04). 고른 칩만 진한 바탕 + 흰 글씨(공용 ChoiceChip).
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
            // 새 프로젝트의 종류·역할 칩과 같은 공용 칩이다. 칸이 좁아도 글자가 잘리지 않게 글자 폭보다 줄지 않는다.
            <ChoiceChip key={part} name="part" value={part} checked={value === part} onChange={onChange} className="min-w-fit! flex-1">
              {AUTH_PART_LABELS[part]}
            </ChoiceChip>
          ))}
        </div>
        {error && <p id={`${id}-error`} className="mt-2 text-caption leading-5 text-error">{error}</p>}
      </div>
    </fieldset>
  );
}
