import Badge from "@/components/ui/Badge";

// AI 질문·요청 카드 맨 위의 줄이다: [AI 질문] [질문 성격] ……… 1 / 5
// tone="dark": 진한 카드 위(회고 AI 질문, 11/13 디자인). 'AI 질문'은 노랑, 진행 숫자는 밝은 회색 굵은 글씨다.
export default function AiPromptHeader({ label = "AI 질문", category, progress, progressLabel, tone = "light" }) {
  const isDark = tone === "dark";
  return (
    <div className="flex items-center gap-2">
      <Badge tone={isDark ? "brand" : "dark"}>{label}</Badge>
      {category}
      <p className={`ml-auto text-label ${isDark ? "font-bold text-locked" : "text-ink-subtle"}`} aria-label={progressLabel}>{progress}</p>
    </div>
  );
}
