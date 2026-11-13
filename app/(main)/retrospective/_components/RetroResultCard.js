import DrawnBorder from "@/components/ui/DrawnBorder";

// 회고를 끝낸 뒤 보여 주는 가운데 흰 카드다(휴회 표시, 완료). 진한 손그림 테두리 + 가운데 정렬.
// 테두리는 다른 회고 카드와 같은 굵기(약 4px)가 되도록 시작 카드의 진한 선 원본을 쓴다.
// 폭·여백은 화면마다 달라 className으로 준다(휴회 896px, 완료 620px).
export default function RetroResultCard({ titleId, className = "", children }) {
  return (
    <section aria-labelledby={titleId} className={`relative mx-auto flex w-full flex-col items-center rounded-[32px] bg-white text-center ${className}`}>
      <DrawnBorder variant="start-card" />
      {children}
    </section>
  );
}
