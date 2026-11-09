"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import Button from "@/components/ui/Button";
import GoogleSignInButton from "@/components/ui/GoogleSignInButton";
import Modal from "@/components/ui/Modal";
import { getAuthMode, getGoogleAuthMode } from "@/lib/authConfig";

// 부모에서 모달이 열릴 때만 마운트해 재인증 단계와 오류를 매번 초기화한다.
export default function WithdrawAccountModal({ onClose }) {
  const { user, withdraw, isAccountBusy, isWithdrawing } = useAuth();
  const [phase, setPhase] = useState("confirm");
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const controllerRef = useRef(null);
  const active = useRef(false);
  const titleRef = useRef(null);
  const googleMode = getGoogleAuthMode();
  const mockMode = getAuthMode() === "mock" && googleMode === "mock";

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (phase === "reauthenticate") titleRef.current?.focus();
  }, [phase]);

  const handleCredential = useCallback(async (idToken) => {
    if (!active.current || inFlight.current || isAccountBusy || phase !== "reauthenticate") return;
    inFlight.current = true;
    setError("");
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      await withdraw(idToken, { signal: controller.signal });
      // 성공하면 AuthProvider가 로그인 화면으로 이동한다.
    } catch (failure) {
      if (!active.current || controller.signal.aborted || failure.name === "AbortError") return;
      setError(failure.status === 401
        ? "본인 확인에 실패했어요. 가입한 Google 계정으로 다시 인증해 주세요."
        : failure.kind === "timeout" || failure.kind === "network"
          ? "탈퇴 결과를 확인하지 못했어요. 로그인 상태를 확인한 후 다시 시도해 주세요."
          : failure.message || "회원 탈퇴를 완료하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      inFlight.current = false;
    }
  }, [isAccountBusy, phase, withdraw]);

  const handleGoogleError = useCallback((message) => {
    if (active.current) setError(message);
  }, []);

  function handleClose() {
    if (inFlight.current || isWithdrawing) return;
    onClose();
  }

  return (
    <Modal open onClose={handleClose} onCancel={(event) => {
      if (inFlight.current || isWithdrawing) event.preventDefault();
    }} aria-labelledby="withdraw-title" aria-describedby="withdraw-warning" aria-busy={isWithdrawing}>
      <h2 ref={titleRef} id="withdraw-title" tabIndex={-1} className="text-heading text-ink focus:outline-none">
        {phase === "confirm" ? "회원 탈퇴" : "Google 계정으로 본인 확인"}
      </h2>
      <p id="withdraw-warning" className="mt-3 text-body text-ink">
        탈퇴하면 회고·스토리 카드·프로젝트 기록이 모두 지워져요. 되돌릴 수 없어요.
      </p>
      <p className="mt-2 text-body-sm text-ink-subtle">필요한 회고록·포트폴리오는 탈퇴 전에 노션 등에 복사해 두세요.</p>
      {phase === "reauthenticate" && (
        <div className="mt-5 space-y-3">
          <p className="break-all text-body-sm text-ink-muted">{user?.email} 계정으로 인증하면 탈퇴가 진행돼요.</p>
          <p className="text-label text-ink-subtle">인증 창을 닫으면 탈퇴하지 않아요. 다시 인증하거나 취소할 수 있어요.</p>
          {mockMode ? (
            <Button variant="outline" className="w-full" disabled={isAccountBusy} onClick={() => handleCredential("mock-google-id-token")}>
              Google 계정으로 본인 확인
            </Button>
          ) : googleMode === "google" ? (
            <GoogleSignInButton disabled={isAccountBusy} onCredential={handleCredential} onError={handleGoogleError} />
          ) : <p role="alert" className="text-body-sm text-error">Google 본인 확인을 사용할 수 없어요. 잠시 후 다시 이용해 주세요.</p>}
        </div>
      )}
      {error && <p role="alert" className="mt-4 text-body-sm text-error">{error}</p>}
      {isWithdrawing && <p role="status" className="mt-4 text-body-sm text-ink-subtle">회원 탈퇴를 처리하고 있어요…</p>}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button variant="outline" onClick={handleClose} disabled={isWithdrawing}>취소</Button>
        {phase === "confirm" && <Button variant="danger" disabled={isAccountBusy} onClick={() => setPhase("reauthenticate")}>탈퇴하기</Button>}
      </div>
    </Modal>
  );
}
