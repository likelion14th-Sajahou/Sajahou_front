"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthRestoreStatus, useAuth } from "@/components/layout/AuthProvider";

// 가입 자격과 완료 후 전환을 관리한다. 가입 POST가 성공한 뒤에는 사용자 조회만 재시도한다.
export default function SignupSession({ children }) {
  const router = useRouter();
  const { signup, cancelSignup, restoreStatus, isAuthenticated } = useAuth();
  useEffect(() => {
    if (restoreStatus !== "ready") return;
    if (isAuthenticated) {
      router.replace("/");
      return;
    }
    if (!signup) {
      cancelSignup("가입하려면 먼저 Google 계정으로 로그인해 주세요.");
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
  }, [signup, cancelSignup, restoreStatus, isAuthenticated, router]);

  if (restoreStatus !== "ready") return <AuthRestoreStatus className="mt-[22px]" />;
  if (isAuthenticated) return <p role="status" className="mt-[22px] text-label text-ink-subtle">홈으로 이동하고 있어요…</p>;
  if (!signup) return null;
  return (
    <>
      <p className="mt-[22px] flex flex-wrap items-center gap-x-[10px] rounded-[14px] bg-canvas px-[14px] py-3">
        <span className="text-label leading-[19.5px] text-ink-subtle">Google 계정</span>
        <span className="break-all text-body leading-6">{signup.email}</span>
      </p>
      <div key={signup.signupToken}>{children}</div>
    </>
  );
}
