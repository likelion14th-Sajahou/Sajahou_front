// 입력 팝업의 고르기 칩이다(Figma 11/15 '프로젝트 종류'·'내 역할'). 높이 42, 모서리 14.
// 기본은 흰 바탕 + 연한 선, 고르면 진한 바탕 + 흰 글씨. 글자는 삼립호빵체.
// type="radio"는 하나만, "checkbox"는 여러 개 고른다. 실제 input을 써서 키보드·스크린리더 동작은 브라우저에 맡긴다.
export default function ChoiceChip({ type = "radio", className = "", children, ...inputProps }) {
  return (
    <label className={`min-w-0 cursor-pointer ${className}`}>
      <input type={type} className="peer sr-only" {...inputProps} />
      <span className="flex h-[42px] items-center justify-center rounded-[14px] border border-line bg-white px-2 font-display text-body-sm whitespace-nowrap text-ink-strong peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink">
        {children}
      </span>
    </label>
  );
}
