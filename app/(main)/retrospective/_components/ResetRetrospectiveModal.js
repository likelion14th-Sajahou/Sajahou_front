"use client";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

// '처음부터'는 되돌릴 수 없어서 한 번 더 확인한다(R-05). 지우는 범위는 API 16 기준이다.
export default function ResetRetrospectiveModal({ open, isResetting, error, onCancel, onConfirm }) {
  function handleClose() {
    if (!isResetting) onCancel();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      onCancel={(event) => {
        if (isResetting) event.preventDefault();
      }}
      aria-labelledby="reset-retrospective-title"
      aria-describedby="reset-retrospective-warning"
      aria-busy={isResetting}
    >
      <h2 id="reset-retrospective-title" className="text-heading text-ink">처음부터 다시 쓸까요?</h2>
      <p id="reset-retrospective-warning" className="mt-3 text-body text-ink">
        올린 자료와 첨부, AI 질문과 답, 카드 초안이 모두 지워져요. 지운 내용은 되돌릴 수 없어요.
      </p>
      {error && <p role="alert" className="mt-4 text-body-sm text-error">{error}</p>}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button variant="outline" onClick={handleClose} disabled={isResetting}>취소</Button>
        <Button variant="danger" onClick={onConfirm} disabled={isResetting} aria-busy={isResetting}>
          {isResetting ? "지우는 중…" : "처음부터 쓰기"}
        </Button>
      </div>
    </Modal>
  );
}
