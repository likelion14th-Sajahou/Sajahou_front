"use client";

import Chip from "@/components/ui/Chip";
import { selectedCompetencyNames } from "@/lib/competencySelection";

const MAX_TAGS = 3;
export const EMPTY_TAGS_MESSAGE = "역량 태그를 하나 이상 골라 주세요";
export const TAG_LIMIT_MESSAGE = `역량 태그는 ${MAX_TAGS}개까지 고를 수 있어요`;

// 회고 검토(R-20), 기록 저장(H-14), 카드 수정(A-10)이 함께 쓰는 역량 태그 선택이다.
// competencies는 역량 목록 조회(API 6) 응답이다(내 파트 8개 + 공통 7개). 칩에 마우스를 올리면 서버가 준 뜻(description)을 보여 준다.
// 보유 카드 수(cardCount)와 상관없이 모두 고를 수 있다. 0장 역량을 막는 것은 나의 사자록 검색 필터(A-07)뿐이다.
// 사용자가 1~3개를 직접 고른다. 4개째를 누르면 onLimit으로 알리고, 0개로 저장하는 것은 쓰는 화면에서 막는다.
// 두 안내가 겹치지 않도록 토스트는 쓰는 화면이 하나만 띄운다.
export default function CompetencyTagPicker({
  id,
  competencies,
  selectedTags,
  listClassName = "gap-x-[3px] gap-y-1",
  // 라벨·칩 모양을 화면 디자인에 맞출 때 준다(회고 검토: 흐린 라벨, 진한 회색 테두리 칩).
  labelClassName = "text-ink-muted",
  hintClassName = "text-ink-subtle",
  chipClassName = "",
  onChange,
  onLimit,
}) {
  const visibleTags = selectedCompetencyNames(selectedTags, competencies);
  function toggleTag(tag) {
    if (visibleTags.includes(tag)) {
      onChange(visibleTags.filter((item) => item !== tag));
      return;
    }

    if (visibleTags.length >= MAX_TAGS) {
      onLimit(TAG_LIMIT_MESSAGE);
      return;
    }

    onChange([...visibleTags, tag]);
  }

  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-1.5">
      <p id={id} className={`text-label ${labelClassName}`}>
        역량 태그 <span className={hintClassName}>· 이 경험에 맞는 역량을 직접 골라요 (1~3개)</span>
      </p>
      <div className={`flex flex-wrap ${listClassName}`}>
        {competencies.map(({ name, description }) => (
          <Chip
            key={name}
            size="sm"
            selected={visibleTags.includes(name)}
            title={description}
            className={chipClassName}
            onClick={() => toggleTag(name)}
          >
            #{name}
          </Chip>
        ))}
      </div>
    </div>
  );
}
