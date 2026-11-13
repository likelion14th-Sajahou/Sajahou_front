"use client";

import { useState } from "react";
import Image from "next/image";

// 넓은 점선 업로드 칸이다(11/13 디자인). 눌러서 고르거나 파일을 끌어다 놓는다.
// 허용 형식(accept)과 고른 파일 처리는 쓰는 화면이 정한다. 끌어다 놓은 파일은 accept로 걸러지지 않으니 onSelect에서 검사한다.
// 버튼 글자는 삼립호빵체, 보조 문구는 본문 글꼴이다. 좁은 화면(640px 미만)에서는 보조 문구를 숨긴다.
export default function FileDropZone({ label, hint = "끌어다 놓아도 돼요", accept, onSelect, disabled = false }) {
  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const files = Array.from(event.dataTransfer.files);
    if (files.length) onSelect(files);
  }

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border-2 px-4 text-body-sm text-ink focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink hover:border-ink hover:bg-[#fef5d2] has-disabled:cursor-not-allowed has-disabled:opacity-60 ${
        isDragging ? "border-solid border-ink bg-[#fef5d2]" : "border-dashed border-line-strong bg-white"
      }`}
    >
      <span className="inline-flex shrink-0 items-center gap-1.5 font-display">
        <Image src="/images/common/upload-18.svg" alt="" width={18} height={18} />
        {label}
      </span>
      <span className="text-caption text-ink-faint max-sm:hidden">{hint}</span>
      <input
        type="file"
        accept={accept}
        multiple
        disabled={disabled}
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
