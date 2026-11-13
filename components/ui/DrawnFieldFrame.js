import DrawnBorder from "./DrawnBorder";

// 입력·선택 필드가 같은 높이와 모서리 규칙으로 손그림 테두리를 사용한다.
export default function DrawnFieldFrame({ height = 38, className = "", error = false, children }) {
  const borderColorClasses = error
    ? "[--field-border-color:var(--color-error-line)]"
    : "[--field-border-color:var(--color-line)] focus-within:[--field-border-color:var(--color-ink)]";

  return (
    <span className={`relative block [&>input]:outline-none [&>select]:outline-none [&>textarea]:outline-none ${borderColorClasses} ${className}`} style={{ "--drawn-border-height": `${height}px` }}>
      <DrawnBorder variant="chip-line" repeat="round" color="var(--field-border-color)" />
      {children}
    </span>
  );
}
