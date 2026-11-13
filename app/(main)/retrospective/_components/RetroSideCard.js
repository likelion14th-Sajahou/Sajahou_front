import DrawnBorder from "@/components/ui/DrawnBorder";

// 회고 화면 오른쪽의 흰 카드다(마감일, 자료 올리는 법, AI가 찾은 더 물어볼 곳). 노란 손그림 테두리 + 밑줄 친 제목.
// border: 테두리 원본. 기본은 마감일 카드의 노란 손그림 테두리다(11/13 디자인보다 굵은 예전 두께).
// action: 제목 오른쪽 장식(마감일의 별 등).
export default function RetroSideCard({ titleId, title, action, border = "deadline-card", className = "", children }) {
  return (
    <aside aria-labelledby={titleId} className={`relative min-w-0 rounded-[24px] bg-white p-6 ${className}`}>
      <DrawnBorder variant={border} />
      <div className="relative flex items-center justify-between border-b border-ink-strong pb-3">
        <h2 id={titleId} className="font-display text-[18px] leading-[28.8px] tracking-[-0.18px] text-ink-strong">{title}</h2>
        {action}
      </div>
      {children}
    </aside>
  );
}
