"use client";

import { useEffect, useRef } from "react";

// 네이티브 dialog를 사용해 포커스 가두기, Esc 닫기, 포커스 복귀를 브라우저에 맡긴다.
export default function Modal({ open, onClose, className = "", children, ...rest }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className={`m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[460px] overflow-y-auto rounded-[28px] bg-white p-7 text-ink backdrop:bg-ink/40 ${className}`}
      {...rest}
    >
      {open && children}
    </dialog>
  );
}
