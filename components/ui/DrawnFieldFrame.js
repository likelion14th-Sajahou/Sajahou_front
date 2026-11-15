import DrawnBorder from "./DrawnBorder";

// 입력·선택 칸을 감싸는 둥근 손그림 틀이다. 박스와 같은 물결 선을 쓴다(이슈 #65).
// 나의 사자록 스토리 카드 거르기 줄(역량 선택·검색)에서만 써서, 나의 사자록 카드와 같은 2px이다.
// 선 색은 평소 회색, 누르면 진하게, 오류면 빨갛다.
export default function DrawnFieldFrame({ className = "", error = false, children }) {
  const borderColorClasses = error
    ? "[--field-border-color:var(--color-error-line)]"
    : "[--field-border-color:var(--color-line)] focus-within:[--field-border-color:var(--color-ink)]";

  return (
    <span className={`relative block rounded-full [&>input]:outline-none [&>select]:outline-none [&>textarea]:outline-none ${borderColorClasses} ${className}`}>
      <DrawnBorder color="var(--field-border-color)" width={2} />
      {children}
    </span>
  );
}
