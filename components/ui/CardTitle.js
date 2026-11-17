// 카드 맨 위의 제목줄이다: 18px 삼립호빵체 제목, 오른쪽 요소(action: 버튼·날짜·별 등), 아래 선.
// 회고 오른쪽 카드·프로젝트 기록 상자·프로젝트 오른쪽 카드·포트폴리오 카드가 함께 쓴다.
// tone="dark": 진한 카드 위라 흰 글씨와 흰 선. description: 제목 옆의 작은 보조 설명.
export default function CardTitle({ id, action, description, tone = "light", className = "", children }) {
  const isDark = tone === "dark";
  return (
    <div className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b pb-3 ${isDark ? "border-white" : "border-ink-strong"} ${className}`}>
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
        <h2 id={id} className={`font-display text-[18px] leading-[29px] tracking-[-0.18px] ${isDark ? "text-white" : "text-ink-strong"}`}>{children}</h2>
        {description && <p className="text-label text-ink-subtle">{description}</p>}
      </div>
      {action}
    </div>
  );
}
