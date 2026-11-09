// 점선 테두리의 파일 올리기 버튼이다. 허용 형식(accept)과 고른 파일 처리는 쓰는 화면이 정한다.
export default function FileUploadButton({ label, ariaLabel = label, accept, onSelect }) {
  return (
    <label className="relative inline-flex shrink-0 cursor-pointer items-center rounded-xl border border-dashed border-line-strong px-3 py-[7px] text-label text-ink-muted focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink">
      {label}
      <input
        type="file"
        accept={accept}
        multiple
        aria-label={ariaLabel}
        className="sr-only"
        onChange={(event) => {
          onSelect(Array.from(event.target.files));
          // 같은 파일을 다시 골라도 onChange가 불리도록 비운다.
          event.target.value = "";
        }}
      />
    </label>
  );
}
