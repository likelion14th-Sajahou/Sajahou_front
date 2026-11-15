import Card from "@/components/ui/Card";
import DrawnBorder from "@/components/ui/DrawnBorder";
import CompetencyTags from "./CompetencyTags";
import { StoryCardIcon, StoryCardTypeBadge } from "./StoryCardVisuals";

export default function StoryCard({ card, isHighlighted = false, onOpen }) {
  const { type, whenLabel, title, tags, evidence } = card;

  return (
    <Card
      as="article"
      size="sm"
      className="relative flex h-full min-w-0 flex-col items-start gap-3 rounded-[24px]! font-display text-[#1f2433] tracking-[-0.15px]"
    >
      <DrawnBorder variant="thin-outline" repeat="round" color={isHighlighted ? "var(--color-shape-yellow)" : "var(--color-ink-300)"} />
      <div className="flex w-full items-center gap-2">
        <span className="flex size-10 shrink-0 items-center justify-center"><StoryCardIcon card={card} /></span>
        <StoryCardTypeBadge type={type} />
        <span className="ml-auto text-right text-caption text-placeholder">{whenLabel}</span>
      </div>
      <h3 className="w-full min-w-0 flex-1 wrap-anywhere break-keep text-[18px] leading-[27px] tracking-[-0.36px]">
        {/* 카드 전체를 눌러도 열리도록 버튼의 영역을 카드 크기로 넓힌다. */}
        <button
          type="button"
          aria-label={`${title} 자세히 보기`}
          onClick={() => onOpen(card.id)}
          className="max-w-full cursor-pointer text-left after:absolute after:inset-0 after:rounded-[24px]"
        >
          {title}
        </button>
      </h3>
      <CompetencyTags tags={tags} />
      {/* 이 카드를 만든 근거(11/15 디자인). 목록 응답의 evidenceSummary를 잇는다. */}
      {evidence && (
        <p className="flex w-full gap-1.5 border-t-2 border-dashed border-line pt-2.5 text-[13px] leading-[20.8px]">
          <span className="shrink-0 text-yellow-700">근거</span>
          <span className="min-w-0 wrap-anywhere text-ink-subtle">{evidence}</span>
        </p>
      )}
    </Card>
  );
}
