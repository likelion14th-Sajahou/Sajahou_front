import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import TextLink from "@/components/ui/TextLink";
import { getStoryCardDetail } from "@/lib/mock/storyCards";
import CompetencyTags from "./CompetencyTags";
import { STORY_CARD_TYPES } from "./storyCardTypes";

const SUMMARY_FIELDS = [
  { key: "situation", label: "상황" },
  { key: "action", label: "행동" },
  { key: "reason", label: "이유" },
  { key: "result", label: "결과" },
  { key: "learned", label: "배운 점" },
];

function DocumentBlock({ block }) {
  const { kind, text, order } = block;

  if (kind === "title") {
    return <p className="text-[15.5px] leading-[27.125px]">{text}</p>;
  }

  if (kind === "section") {
    return <p className="pt-2.5 text-[14.5px] leading-[25.375px]">{text}</p>;
  }

  if (kind === "subheading") {
    return <p className="pt-2 text-body-sm leading-[24.5px]">{text}</p>;
  }

  if (kind === "number") {
    return (
      <p className="relative pl-5 text-[14.5px] leading-[25.375px]">
        <span className="absolute left-0.5 text-label leading-[22.75px] text-accent-strong">{order}</span>
        {text}
      </p>
    );
  }

  return (
    <p className="relative pl-3.5 text-[14.5px] leading-[25.375px]">
      <span className="absolute left-[3px] text-accent-strong">·</span>
      {text}
    </p>
  );
}

function SummaryDetails({ summary }) {
  const emptyCount = SUMMARY_FIELDS.filter(({ key }) => !summary[key]).length;

  return (
    <details className="group w-full rounded-2xl border border-line px-4 py-3">
      <summary className="flex cursor-pointer list-none gap-1.5 [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="w-[15px] text-body group-open:hidden">▸</span>
        <span aria-hidden="true" className="hidden w-[15px] text-body group-open:inline">▾</span>
        <span className="text-body">
          자소서에 쓰는 요약{" "}
          <span className="text-label text-ink-subtle">상황 · 행동 · 이유 · 결과 · 배운 점</span>
        </span>
      </summary>
      <dl className="pt-1.5">
        {SUMMARY_FIELDS.map(({ key, label }) => (
          <div key={key} className="grid grid-cols-[64px_1fr] gap-3 border-t border-line py-3">
            <dt className="pt-0.5 text-label text-accent-strong">{label}</dt>
            <dd className="text-body leading-[25.5px]">
              {summary[key] || (
                <span className="inline-block rounded-lg border border-dashed border-[#d7d3cb] px-2.5 text-body-sm text-ink-subtle">
                  아직 기록에 없어요
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
      {emptyCount > 0 && (
        <p className="border-t border-line pt-3 text-label text-ink-subtle">
          ⚑ 빈칸 {emptyCount}곳은 자소서 초안에서도 빈칸으로 남아요. 수정에서 직접 채울 수 있어요.
        </p>
      )}
    </details>
  );
}

export default function StoryCardDetail({ card, titleId, onClose }) {
  const { type, whenLabel, shape, color, title, tags, evidence } = card;
  const { label, tone } = STORY_CARD_TYPES[type];
  const { document, summary } = getStoryCardDetail(card);

  return (
    <div className="flex flex-col items-start gap-3.5">
      <div className="flex w-full items-center gap-2.5">
        <ShapeCharacter shape={shape} color={color} size={36} />
        <Badge tone={tone}>{label}</Badge>
        <span className="text-label text-ink-subtle">{whenLabel}</span>
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="ml-auto flex size-9 cursor-pointer items-center justify-center rounded-full bg-canvas text-title"
        >
          ×
        </button>
      </div>
      <h2 id={titleId} className="break-keep text-heading leading-[30.8px] tracking-[-0.44px]">
        {title}
      </h2>
      <CompetencyTags tags={tags} />
      <section className="w-full rounded-2xl border border-line px-4 py-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-body font-normal">
            {type === "project" ? "포트폴리오 전문" : "회고록 전문"}
          </h3>
          <Button size="sm">노션에 복사</Button>
        </div>
        <div className="pt-2">
          {document.map((block, index) => (
            <DocumentBlock key={index} block={block} />
          ))}
        </div>
      </section>
      <SummaryDetails summary={summary} />
      <p className="flex w-full gap-2.5 rounded-[14px] bg-canvas px-3.5 py-3 text-[13.5px] leading-[21.6px]">
        <span className="shrink-0">근거</span>
        <span>{evidence}</span>
      </p>
      <div className="flex w-full items-center justify-between gap-3.5 pt-1">
        <TextLink variant="danger">삭제</TextLink>
        <div className="flex gap-2">
          <Button variant="secondary">수정</Button>
          <Button onClick={onClose}>닫기</Button>
        </div>
      </div>
    </div>
  );
}
