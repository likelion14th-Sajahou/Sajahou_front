// 디자인 시스템(Figma 'Checkbox'): 20px 둥근 상자. 체크하면 진한 바탕에 흰 체크 표시.
// 브라우저 기본 체크박스를 지우고(appearance-none) 같은 input에 모양만 입힌다. 라벨·상태 처리는 쓰는 쪽이 한다.
export default function Checkbox({ className = "", ...rest }) {
  return (
    <input
      type="checkbox"
      className={`size-5 shrink-0 cursor-pointer appearance-none rounded-[6px] border-[1.5px] border-ink-300 bg-white bg-origin-border bg-center bg-no-repeat checked:border-transparent checked:bg-[url(/images/common/checkbox-checked.svg)] checked:bg-[length:20px_20px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${className}`}
      {...rest}
    />
  );
}
