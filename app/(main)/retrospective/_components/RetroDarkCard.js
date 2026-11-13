import DrawnBorder from "@/components/ui/DrawnBorder";

// 회고 단계 화면의 진한 카드다(자료 올리기, AI 질문, 질문 끝). 진한 바탕 + 같은 색 손그림 테두리.
// border: 카드 크기에 가까운 테두리 원본(긴 자료 카드는 materials-card, 질문 카드처럼 짧은 카드는 start-card).
// 11/13 디자인의 테두리는 얇아졌지만, 손그림 테두리는 예전 두께(이 원본들)를 그대로 쓴다.
export default function RetroDarkCard({ as: Tag = "section", border, className = "", children, ...rest }) {
  return (
    <Tag className={`relative flex min-w-0 flex-col gap-4 rounded-[24px] bg-ink-900 px-7 py-6 text-white ${className}`} {...rest}>
      <DrawnBorder variant={border} />
      {children}
    </Tag>
  );
}
