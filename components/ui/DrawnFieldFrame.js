// 입력·선택 칸을 감싸는 둥근 틀이다. 나의 사자록 스토리 카드 거르기 줄(역량 선택·검색)에서만 쓴다.
// 물결 없이 곧은 2px 선이다(이슈 #65). 선 색은 평소 회색, 누르면 진하게, 오류면 빨갛다.
// 선은 칸 바깥에 그려서(ring) 칸 크기를 바꾸지 않는다.
export default function DrawnFieldFrame({ className = "", error = false, children }) {
  const borderColorClasses = error
    ? "[--field-border-color:var(--color-error-line)]"
    : "[--field-border-color:var(--color-line)] focus-within:[--field-border-color:var(--color-ink)]";

  return (
    <span className={`relative block rounded-full ring-2 ring-(--field-border-color) [&>input]:outline-none [&>select]:outline-none [&>textarea]:outline-none ${borderColorClasses} ${className}`}>
      {children}
    </span>
  );
}
