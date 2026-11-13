"use client";

import { useEffect, useRef } from "react";

const SIZE_CLASSES = {
  md: "max-w-[460px]",
  lg: "max-w-[560px]",
  project: "max-w-[520px]",
};

// 네이티브 dialog를 사용해 포커스 가두기, Esc 닫기, 포커스 복귀를 브라우저에 맡긴다.
export default function Modal({ open, onClose, size = "md", className = "", contentClassName = "p-7", border, children, ...rest }) {
  const dialogRef = useRef(null);
  const isBackdropPress = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // 여백은 안쪽 div에 있어서 dialog 자신이 눌렸다면 바깥(배경)을 누른 것이다.
  // 드래그하다 안팎을 넘나든 경우에는 닫지 않도록 누른 위치와 뗀 위치를 모두 확인한다.
  function handlePointerDown(event) {
    isBackdropPress.current = event.target === event.currentTarget;
  }

  function handlePointerUp(event) {
    if (event.target !== event.currentTarget) {
      isBackdropPress.current = false;
    }
  }

  function handleClick(event) {
    const isBackdropClick = isBackdropPress.current && event.target === event.currentTarget;

    isBackdropPress.current = false;

    if (isBackdropClick) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
      className={`m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] overflow-y-auto rounded-[28px] bg-white text-ink backdrop:bg-ink/40 ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {border}
      <div className={contentClassName}>{open && children}</div>
    </dialog>
  );
}
