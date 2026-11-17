// 카드 맨 아래의 버튼 줄이다. 위에 회색 선을 긋고, 간격·정렬은 쓰는 곳이 className으로 정한다.
export default function ActionFooter({ className = "gap-3.5", children }) {
  return (
    <div className="w-full pt-1">
      <div className={`flex flex-wrap items-center border-t border-line pt-4 ${className}`}>{children}</div>
    </div>
  );
}
