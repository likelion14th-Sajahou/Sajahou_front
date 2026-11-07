"use client";

import { useMockData } from "@/components/layout/MockDataProvider";
import Chip from "@/components/ui/Chip";
import { getCompetencies } from "@/lib/mock/competencies";

const MAX_TAGS = 3;
export const EMPTY_TAGS_MESSAGE = "역량 태그를 하나 이상 골라 주세요";
export const TAG_LIMIT_MESSAGE = `역량 태그는 ${MAX_TAGS}개까지 고를 수 있어요`;

// 회고 검토(R-20), 기록 저장(H-14), 카드 수정(A-10)이 함께 쓰는 역량 태그 선택이다.
// 사용자가 1~3개를 직접 고른다. 4개째를 누르면 onLimit으로 알리고, 0개로 저장하는 것은 쓰는 화면에서 막는다.
// 두 안내가 겹치지 않도록 토스트는 쓰는 화면이 하나만 띄운다.
export default function CompetencyTagPicker({
  id,
  competencies,
  selectedTags,
  listClassName = "gap-x-[3px] gap-y-1",
  onChange,
  onLimit,
}) {
  const { user } = useMockData();
  const descriptions = new Map(
    getCompetencies(user.part).map(({ name, description }) => [name, description]),
  );

  function toggleTag(tag) {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((item) => item !== tag));
      return;
    }

    if (selectedTags.length >= MAX_TAGS) {
      onLimit(TAG_LIMIT_MESSAGE);
      return;
    }

    onChange([...selectedTags, tag]);
  }

  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-1.5">
      <p id={id} className="text-label text-ink-muted">
        역량 태그 <span className="text-ink-subtle">· 이 경험에 맞는 역량을 직접 골라요 (1~3개)</span>
      </p>
      <div className={`flex flex-wrap ${listClassName}`}>
        {competencies.map((tag) => (
          <Chip
            key={tag}
            size="sm"
            selected={selectedTags.includes(tag)}
            title={descriptions.get(tag)}
            onClick={() => toggleTag(tag)}
          >
            #{tag}
          </Chip>
        ))}
      </div>
    </div>
  );
}
