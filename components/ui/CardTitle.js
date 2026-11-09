// 카드 맨 위의 제목줄이다. 오른쪽에 도형·버튼·날짜 같은 요소(action)를 두고, 아래에 검은 선을 긋는다.
export default function CardTitle({ id, action, children }) {
  return (
    <div className="flex items-center justify-between border-b border-ink pb-3">
      <h2 id={id} className="text-[18px] tracking-[-0.18px] text-ink">{children}</h2>
      {action}
    </div>
  );
}
