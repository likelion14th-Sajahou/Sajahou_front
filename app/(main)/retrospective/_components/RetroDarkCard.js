import DrawnBorder from "@/components/ui/DrawnBorder";

// 회고 단계 화면의 진한 카드다(자료 올리기, AI 질문, 질문 끝). 진한 바탕 + 같은 색 손그림 테두리.
export default function RetroDarkCard({ as: Tag = "section", className = "", children, ...rest }) {
  return (
    <Tag className={`relative flex min-w-0 flex-col gap-4 rounded-[24px] bg-ink-900 px-7 py-6 text-white ${className}`} {...rest}>
      <DrawnBorder />
      {children}
    </Tag>
  );
}
