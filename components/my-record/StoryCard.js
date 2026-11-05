import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import CompetencyTags from "./CompetencyTags";
import { STORY_CARD_TYPES } from "./storyCardTypes";

export default function StoryCard({ card, isHighlighted = false, onOpen }) {
  const { type, whenLabel, shape, color, title, tags, evidence } = card;
  const { label, tone } = STORY_CARD_TYPES[type];

  return (
    <Card
      as="article"
      size="sm"
      className={`relative flex h-full flex-col items-start gap-2.5 border border-transparent ${
        isHighlighted ? "shadow-[0_0_0_3px_var(--color-accent)]" : ""
      }`}
    >
      <div className="flex w-full items-center gap-2">
        <ShapeCharacter shape={shape} color={color} face="none" size={30} />
        <Badge tone={tone}>{label}</Badge>
        <span className="ml-auto text-caption text-ink-subtle">{whenLabel}</span>
      </div>
      <h3 className="break-keep text-[17px] leading-[23.8px] tracking-[-0.17px] text-ink">
        {/* 카드 전체를 눌러도 열리도록 버튼의 영역을 카드 크기로 넓힌다. */}
        <button
          type="button"
          aria-label={`${title} 자세히 보기`}
          onClick={() => onOpen(card.id)}
          className="cursor-pointer text-left after:absolute after:inset-0 after:rounded-[22px]"
        >
          {title}
        </button>
      </h3>
      <CompetencyTags tags={tags} />
      <p className="mt-auto flex w-full gap-1.5 border-t border-dashed border-line pt-2.5 text-label text-ink-muted">
        <span>근거</span>
        <span>{evidence}</span>
      </p>
    </Card>
  );
}
