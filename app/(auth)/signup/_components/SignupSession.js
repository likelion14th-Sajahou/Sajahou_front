"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthRestoreStatus, useAuth } from "@/components/layout/AuthProvider";
import GoogleAccountInfo from "@/components/profile/GoogleAccountInfo";

// 가입 자격과 완료 후 전환을 관리한다. 가입 POST가 성공한 뒤에는 사용자 조회만 재시도한다.
export default function SignupSession({ children }) {
  const router = useRouter();
  const { signup, cancelSignup, restoreStatus, isAuthenticated, notice } = useAuth();
  useEffect(() => {
    if (restoreStatus !== "ready") return;
    if (isAuthenticated) {
      router.replace("/");
      return;
    }
    if (!signup) {
      cancelSignup(notice || "가입하려면 먼저 Google 계정으로 로그인해 주세요.");
      return;
    }
    if (signup.submitted) return;
    const remaining = signup.expiresAt - Date.now();
    if (remaining <= 0) {
      cancelSignup("가입 시간이 만료되었어요. 다시 로그인해 주세요.");
      return;
    }
    const timer = setTimeout(() => cancelSignup("가입 시간이 만료되었어요. 다시 로그인해 주세요."), remaining);
    return () => clearTimeout(timer);
  }, [signup, cancelSignup, restoreStatus, isAuthenticated, notice, router]);

  if (restoreStatus !== "ready") return <AuthRestoreStatus className="mt-[22px]" />;
  if (isAuthenticated) return <p role="status" className="mt-[22px] text-label text-ink-subtle">홈으로 이동하고 있어요…</p>;
  if (!signup) return null;
  return (
    <>
      <GoogleAccountInfo email={signup.email} className="my-6 w-full" />
      <div key={signup.signupToken}>{children}</div>
    </>
  );
}
