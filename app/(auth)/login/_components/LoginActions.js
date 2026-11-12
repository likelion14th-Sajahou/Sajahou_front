"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { loginDemo, loginWithGoogle } from "@/lib/auth";
import { getGoogleAuthMode } from "@/lib/authConfig";
import { AuthRestoreStatus, useAuth } from "@/components/layout/AuthProvider";
import GoogleSignInButton from "@/components/ui/GoogleSignInButton";
import { getRequestErrorMessage } from "@/lib/requestErrorMessage";

export default function LoginActions() {
  const router = useRouter();
  const { isAuthenticated, restoreStatus, acceptGoogleLogin, completeLogin, clearSignup, notice, clearNotice } = useAuth();
  const requestInFlight = useRef(false);
  const controllerRef = useRef(null);
  const [loginType, setLoginType] = useState(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const submitting = loginType !== null || pending;
  const busy = submitting || restoreStatus !== "ready";
  const googleMode = getGoogleAuthMode();

  useEffect(() => {
    clearSignup();
    return () => controllerRef.current?.abort();
  }, [clearSignup]);

  useEffect(() => {
    if (restoreStatus === "ready" && isAuthenticated) router.replace("/");
  }, [isAuthenticated, restoreStatus, router]);

  const handleLogin = useCallback(async (idToken, demo = false) => {
    if (requestInFlight.current || pending || restoreStatus !== "ready" || isAuthenticated) return;

    requestInFlight.current = true;
    setLoginType(demo ? "demo" : "google");
    setError("");
    clearNotice();
    const controller = new AbortController();
    controllerRef.current = controller;

    let loginAccepted = false;
    try {
      const options = { signal: controller.signal };
      const result = demo ? await loginDemo(options) : await loginWithGoogle(idToken, options);
      loginAccepted = true;
      const destination = demo
        ? (await completeLogin(options) ? "/" : null)
        : await acceptGoogleLogin(result, options);
      if (destination && !controller.signal.aborted) startTransition(() => router.replace(destination));
    } catch (failure) {
      if (controller.signal.aborted) return;
      setError(!loginAccepted && demo && failure.status === 404
        ? "지금은 데모 계정을 이용할 수 없어요. Google 계정으로 로그인해 주세요."
        : !loginAccepted && !demo && failure.status === 401 ? "Google 인증이 만료되었어요. 다시 로그인해 주세요."
          : getRequestErrorMessage(failure, loginAccepted
            ? "로그인한 사용자 정보를 확인하지 못했어요. 다시 시도해 주세요."
            : "로그인하지 못했어요. 잠시 후 다시 시도해 주세요."));
    } finally {
      requestInFlight.current = false;
      setLoginType(null);
    }
  }, [pending, restoreStatus, isAuthenticated, clearNotice, completeLogin, acceptGoogleLogin, router]);

  const handleCredential = useCallback((idToken) => handleLogin(idToken), [handleLogin]);
  const handleGoogleError = useCallback((message) => setError(message), []);

  if (isAuthenticated) return <p role="status" className="mt-[22px] text-center text-label text-ink-subtle">홈으로 이동하고 있어요…</p>;

  return (
    <div className="mt-[22px] flex flex-col items-center gap-[14px]" aria-busy={busy}>
      {googleMode === "mock" ? <Button
        variant="outline"
        onClick={() => handleLogin("mock-google-id-token")}
        disabled={busy}
        aria-describedby={error ? "login-error" : undefined}
        className="w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
      >
        {loginType === "google" ? "로그인 확인 중…" : "Google 계정으로 계속하기"}
      </Button> : <GoogleSignInButton disabled={busy} onCredential={handleCredential} onError={handleGoogleError} />}
      <AuthRestoreStatus />
      {submitting && <p role="status" className="text-label text-ink-subtle">{loginType === "demo" ? "데모 계정으로 로그인하고 있어요…" : "로그인 확인 중…"}</p>}
      {error && <p id="login-error" role="alert" className="text-label text-error">{error}</p>}
      {!error && notice && <p role="status" className="text-label text-ink-subtle">{notice}</p>}
      {/* 데모 로그인은 Figma 시작 화면의 Secondary 버튼이다. */}
      <Button variant="secondary" disabled={busy} aria-describedby={error ? "login-error" : undefined} onClick={() => handleLogin(null, true)} className="w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">
        {loginType === "demo" ? "데모 로그인 중…" : "데모 계정으로 둘러보기"}
      </Button>
    </div>
  );
}
