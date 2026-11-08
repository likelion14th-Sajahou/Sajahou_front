"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";
import { loginDemo, loginWithGoogle } from "@/lib/auth";
import { getGoogleAuthMode } from "@/lib/authConfig";
import { useAuth } from "@/components/layout/AuthProvider";
import GoogleSignInButton from "./GoogleSignInButton";

export default function LoginActions() {
  const router = useRouter();
  const { isAuthenticated, acceptGoogleLogin, completeLogin, clearSignup, notice, clearNotice } = useAuth();
  const requestInFlight = useRef(false);
  const controllerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const busy = loading || pending;
  const googleMode = getGoogleAuthMode();

  useEffect(() => {
    clearSignup();
    return () => controllerRef.current?.abort();
  }, [clearSignup]);

  useEffect(() => {
    if (isAuthenticated) router.replace("/");
  }, [isAuthenticated, router]);

  const handleLogin = useCallback(async (idToken, demo = false) => {
    if (requestInFlight.current || pending) return;

    requestInFlight.current = true;
    setLoading(true);
    setError("");
    clearNotice();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const options = { signal: controller.signal };
      const result = demo ? await loginDemo(options) : await loginWithGoogle(idToken, options);
      const destination = demo
        ? (await completeLogin(options) ? "/" : null)
        : await acceptGoogleLogin(result, options);
      if (destination && !controller.signal.aborted) startTransition(() => router.replace(destination));
    } catch (failure) {
      if (controller.signal.aborted) return;
      setError(demo && failure.status === 404
        ? "지금은 데모 계정을 이용할 수 없어요. Google 계정으로 로그인해 주세요."
        : failure.status === 401 ? "Google 인증이 만료되었어요. 다시 로그인해 주세요."
          : "로그인하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      requestInFlight.current = false;
      setLoading(false);
    }
  }, [pending, clearNotice, completeLogin, acceptGoogleLogin, router]);

  const handleCredential = useCallback((idToken) => handleLogin(idToken), [handleLogin]);
  const handleGoogleError = useCallback((message) => setError(message), []);

  if (isAuthenticated) return <p role="status" className="mt-[22px] text-center text-label text-ink-subtle">홈으로 이동하고 있어요…</p>;

  return (
    <div className="mt-[22px] flex flex-col items-center gap-[14px]" aria-busy={busy}>
      {googleMode === "mock" ? <Button
        variant="outline"
        onClick={() => handleLogin("mock-google-id-token")}
        disabled={busy}
        aria-describedby={error ? "google-login-error" : undefined}
        className="w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
      >
        {busy ? "로그인 확인 중…" : "Google 계정으로 계속하기"}
      </Button> : <GoogleSignInButton disabled={busy} onCredential={handleCredential} onError={handleGoogleError} />}
      {busy && googleMode === "google" && <p role="status" className="text-label text-ink-subtle">로그인 확인 중…</p>}
      {error && <p id="google-login-error" role="alert" className="text-label text-error">{error}</p>}
      {!error && notice && <p role="status" className="text-label text-ink-subtle">{notice}</p>}
      <TextLink disabled={busy} onClick={() => handleLogin(null, true)} className="leading-[21px] disabled:cursor-default disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">
        데모 계정으로 둘러보기
      </TextLink>
    </div>
  );
}
