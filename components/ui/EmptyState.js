// 목록이 비었을 때 보여 주는 점선 상자다. 예: 프로젝트 기록이 없을 때, 걸러 본 카드가 없을 때.
export default function EmptyState({ className = "", children, ...rest }) {
  return (
    <p
      className={`rounded-[20px] border border-dashed border-line-medium p-6 text-center text-body text-ink-subtle ${className}`}
      {...rest}
    >
      {children}
    </p>
  );
}
