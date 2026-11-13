import Image from "next/image";

// 링크 아이콘이 붙은 회색 입력칸 안에 '추가' 버튼이 들어간 링크 입력이다(11/13 디자인). Enter로도 추가한다.
// 비어 있으면 '추가'를 흐리게 막는다. 링크 검사는 쓰는 화면이 onAdd에서 한다.
// 입력한 글은 Pretendard(font-input), 버튼은 삼립호빵체다.
export default function LinkPasteField({ value, onChange, onAdd, className = "", ...inputProps }) {
  const isEmpty = !value.trim();

  return (
    <div className={`flex h-11 min-w-0 items-center gap-2 rounded-xl border border-transparent bg-canvas pr-1.5 pl-3 focus-within:border-ink focus-within:bg-white ${className}`}>
      <Image src="/images/common/link-18.svg" alt="" width={18} height={18} className="shrink-0" />
      <input
        type="text"
        className="h-full min-w-0 flex-1 bg-transparent font-input text-body-sm text-ink outline-none placeholder:text-ink-300"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (!isEmpty) onAdd();
          }
        }}
        {...inputProps}
      />
      <button
        type="button"
        onClick={onAdd}
        disabled={isEmpty}
        className="h-8 shrink-0 cursor-pointer rounded-full bg-ink px-3.5 font-display text-label text-white disabled:cursor-default disabled:bg-locked disabled:text-ink-faint"
      >
        추가
      </button>
    </div>
  );
}
