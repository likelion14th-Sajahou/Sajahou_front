import Badge from "@/components/ui/Badge";

// AI 질문·요청 카드 맨 위의 줄이다: [AI 질문] [질문 성격] ……… 1 / 5
export default function AiPromptHeader({ label = "AI 질문", category, progress, progressLabel }) {
  return (
    <div className="flex items-center gap-2">
      <Badge tone="dark">{label}</Badge>
      {category}
      <p className="ml-auto text-label text-ink-subtle" aria-label={progressLabel}>{progress}</p>
    </div>
  );
}
