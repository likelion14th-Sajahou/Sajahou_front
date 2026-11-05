import Chip from "@/components/ui/Chip";

const MIN_TAGS = 1;
const MAX_TAGS = 3;

export default function CompetencyTagPicker({
  id,
  competencies,
  selectedTags,
  listClassName = "gap-x-[3px] gap-y-1",
  dimLocked = true,
  onChange,
}) {
  function toggleTag(tag) {
    onChange(
      selectedTags.includes(tag)
        ? selectedTags.filter((item) => item !== tag)
        : [...selectedTags, tag],
    );
  }

  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-1.5">
      <p id={id} className="text-label text-ink-muted">
        역량 태그{" "}
        <span className="text-ink-subtle">
          · AI가 정해진 역량 15개 중에서 골랐어요. 눌러서 빼거나 더할 수 있어요 (최대 3개)
        </span>
      </p>
      <div className={`flex flex-wrap ${listClassName}`}>
        {competencies.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          const isLocked = isSelected
            ? selectedTags.length <= MIN_TAGS
            : selectedTags.length >= MAX_TAGS;

          return (
            <Chip
              key={tag}
              size="sm"
              selected={isSelected}
              disabled={isLocked}
              onClick={() => toggleTag(tag)}
              className={`disabled:cursor-default ${!isSelected && dimLocked ? "disabled:opacity-40" : ""}`}
            >
              #{tag}
            </Chip>
          );
        })}
      </div>
    </div>
  );
}
