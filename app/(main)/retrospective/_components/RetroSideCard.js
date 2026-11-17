import CardTitle from "@/components/ui/CardTitle";
import DrawnBorder from "@/components/ui/DrawnBorder";

// 회고 화면 오른쪽의 흰 카드다(마감일, 자료 올리는 법, AI가 찾은 더 물어볼 곳). 노란 손그림 테두리 + 밑줄 친 제목.
// action: 제목 오른쪽 장식(마감일의 별 등).
export default function RetroSideCard({ titleId, title, action, className = "", children }) {
  return (
    <aside aria-labelledby={titleId} className={`relative min-w-0 rounded-[24px] bg-white p-6 ${className}`}>
      <DrawnBorder color="var(--color-yellow-400)" />
      <CardTitle id={titleId} action={action} className="relative">{title}</CardTitle>
      {children}
    </aside>
  );
}
