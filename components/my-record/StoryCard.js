import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import ShapeCharacter from "@/components/ui/ShapeCharacter";

const TYPE_BADGES = {
  session: { label: "세션 회고", tone: "blue" },
  assignment: { label: "과제 회고", tone: "green" },
  project: { label: "프로젝트", tone: "yellow" },
};

export default function StoryCard({ card }) {
  const { type, whenLabel, shape, color, title, tags, evidence } = card;
  const { label, tone } = TYPE_BADGES[type];

  return (
    <Card as="article" size="sm" className="flex h-full flex-col items-start gap-2.5 border border-transparent">
      <div className="flex w-full items-center gap-2">
        <ShapeCharacter shape={shape} color={color} face="none" size={30} />
        <Badge tone={tone}>{label}</Badge>
        <span className="ml-auto text-caption text-ink-subtle">{whenLabel}</span>
      </div>
      <h3 className="break-keep text-[17px] leading-[23.8px] tracking-[-0.17px] text-ink">{title}</h3>
      <ul className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <li key={tag} className="rounded-full bg-canvas px-2.5 py-1 text-caption text-ink">
            #{tag}
          </li>
        ))}
      </ul>
      <p className="mt-auto flex w-full gap-1.5 border-t border-dashed border-line pt-2.5 text-label text-ink-muted">
        <span>근거</span>
        <span>{evidence}</span>
      </p>
    </Card>
  );
}
