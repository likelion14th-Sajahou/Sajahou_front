import Badge from "@/components/ui/Badge";

export default function AiPromptHeader({ label = "AI 질문", category, progress }) {
  return (
    <div className="flex items-center gap-2">
      <Badge tone="dark">{label}</Badge>
      {category}
      <p className="ml-auto text-label text-ink-subtle">{progress}</p>
    </div>
  );
}
