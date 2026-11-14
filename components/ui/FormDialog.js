"use client";

import Button from "./Button";
import DrawnBorder from "./DrawnBorder";
import Modal from "./Modal";
import TextLink from "./TextLink";

// 입력 팝업의 공통 틀이다(Figma '[디] 01-c 새 프로젝트 팝업'·'01-d 내 정보 수정', 11/15).
// 가운데 정렬된 머리(아이콘·제목·설명) 아래에 내용(폼)을 둔다. 구역은 MarkedSection, 아래 버튼은 FormDialogActions를 쓴다.
// 테두리는 다른 화면과 같은 손그림 선(start-card)이다. 선이 팝업 밖으로 나가므로 팝업은 자르지 않고 스크롤은 안쪽 칸이 맡는다.
// busy인 동안에는 Esc·바깥 누르기로 닫히지 않는다.
// showClose: 오른쪽 위 X 닫기 버튼(내 정보 수정처럼 '취소' 대신 닫기 버튼을 두는 팝업).
export default function FormDialog({ open, onClose, busy = false, showClose = false, titleId, icon, title, description, children }) {
  return (
    <Modal
      open={open}
      size="form"
      className="overflow-visible! rounded-[24px]! backdrop:bg-ink-strong/40!"
      contentClassName="relative flex max-h-[calc(100dvh-32px)] flex-col gap-8 overflow-y-auto rounded-[24px] px-6 pt-12 pb-8 sm:px-12"
      border={<DrawnBorder variant="start-card" />}
      onClose={busy ? () => {} : onClose}
      onCancel={(event) => { if (busy) event.preventDefault(); }}
      aria-labelledby={titleId}
    >
      {showClose && (
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          disabled={busy}
          className="absolute top-6 right-6 flex size-8 cursor-pointer items-center justify-center rounded-full before:absolute before:h-0.5 before:w-[18px] before:rotate-45 before:rounded-[1px] before:bg-ink-500 after:absolute after:h-0.5 after:w-[18px] after:-rotate-45 after:rounded-[1px] after:bg-ink-500 focus-visible:outline-2 focus-visible:outline-ink disabled:cursor-default disabled:opacity-60"
        />
      )}
      <header className="flex flex-col items-center gap-4 text-center">
        {icon}
        <div className="flex flex-col gap-1.5">
          <h2 id={titleId} className="font-display text-[26px] leading-9 tracking-[-0.52px] text-ink-strong">{title}</h2>
          {description && <p className="text-label leading-5 text-ink-subtle">{description}</p>}
        </div>
      </header>
      {children}
    </Modal>
  );
}

// 팝업 맨 아래: 꽉 찬 노란 주 버튼과 밑줄 '취소'(onCancel이 있을 때만). children은 그 아래에 더 두는 내용이다(예: 내 정보의 로그아웃·회원 탈퇴).
// submitDisabled: 바꾼 게 없을 때처럼 주 버튼을 막는다.
export function FormDialogActions({ submitLabel, busy = false, busyLabel = submitLabel, submitDisabled = false, onCancel, children }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Button type="submit" disabled={submitDisabled} className="w-full">{busy ? busyLabel : submitLabel}</Button>
      {onCancel && <TextLink size="sm" onClick={onCancel}>취소</TextLink>}
      {children}
    </div>
  );
}
