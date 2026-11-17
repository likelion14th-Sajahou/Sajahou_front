"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginWithGoogle } from "@/lib/auth";
import { AuthRestoreStatus, useAuth } from "@/components/layout/AuthProvider";
import GoogleSignInButton from "@/components/ui/GoogleSignInButton";
import { getRequestErrorMessage } from "@/lib/requestErrorMessage";

export default function LoginActions() {
  const router = useRouter();
  const { isAuthenticated, restoreStatus, acceptGoogleLogin, clearSignup, notice, clearNotice } = useAuth();
  const requestInFlight = useRef(false);
  const controllerRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const submitting = isSubmitting || pending;
  const busy = submitting || restoreStatus !== "ready";

  useEffect(() => {
    clearSignup();
    return () => controllerRef.current?.abort();
  }, [clearSignup]);

  useEffect(() => {
    if (restoreStatus === "ready" && isAuthenticated) router.replace("/");
  }, [isAuthenticated, restoreStatus, router]);

  const handleLogin = useCallback(async (idToken) => {
    if (requestInFlight.current || pending || restoreStatus !== "ready" || isAuthenticated) return;

    requestInFlight.current = true;
    setIsSubmitting(true);
    setError("");
    clearNotice();
    const controller = new AbortController();
    controllerRef.current = controller;

    let loginAccepted = false;
    try {
      const options = { signal: controller.signal };
      const result = await loginWithGoogle(idToken, options);
      loginAccepted = true;
      const destination = await acceptGoogleLogin(result, options);
      if (destination && !controller.signal.aborted) startTransition(() => router.replace(destination));
    } catch (failure) {
      if (controller.signal.aborted) return;
      setError(!loginAccepted && failure.status === 401 ? "Google 인증이 만료되었어요. 다시 로그인해 주세요."
          : getRequestErrorMessage(failure, loginAccepted
            ? "로그인한 사용자 정보를 확인하지 못했어요. 다시 시도해 주세요."
            : "로그인하지 못했어요. 잠시 후 다시 시도해 주세요."));
    } finally {
      requestInFlight.current = false;
      setIsSubmitting(false);
    }
  }, [pending, restoreStatus, isAuthenticated, clearNotice, acceptGoogleLogin, router]);

  const handleCredential = useCallback((idToken) => handleLogin(idToken), [handleLogin]);
  const handleGoogleError = useCallback((message) => setError(message), []);

  if (isAuthenticated) return <p role="status" className="text-center text-label text-ink-subtle">홈으로 이동하고 있어요…</p>;

  // Google SDK가 로그인 버튼을 렌더링한다.
  return (
    <div className="flex w-full flex-col items-center gap-3" aria-busy={busy}>
      <GoogleSignInButton disabled={busy} onCredential={handleCredential} onError={handleGoogleError} />
      <AuthRestoreStatus />
      {submitting && <p role="status" className="text-label text-ink-subtle">로그인 확인 중…</p>}
      {error && <p id="login-error" role="alert" className="text-label text-error">{error}</p>}
      {!error && notice && <p role="status" className="text-label text-ink-subtle">{notice}</p>}
    </div>
  );
}
