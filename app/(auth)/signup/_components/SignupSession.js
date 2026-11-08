"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/layout/AuthProvider";

// 가입 폼은 별도 구현한다. 로그인에서 받은 가입 자격과 이메일만 연결한다.
export default function SignupSession({ children }) {
  const { signup, cancelSignup } = useAuth();
  useEffect(() => {
    if (!signup) {
      cancelSignup("가입하려면 먼저 Google 계정으로 로그인해 주세요.");
      return;
    }
    const remaining = signup.expiresAt - Date.now();
    if (remaining <= 0) {
      cancelSignup("가입 시간이 만료되었어요. 다시 로그인해 주세요.");
      return;
    }
    const timer = setTimeout(() => cancelSignup("가입 시간이 만료되었어요. 다시 로그인해 주세요."), remaining);
    return () => clearTimeout(timer);
  }, [signup, cancelSignup]);

  if (!signup) return null;
  return (
    <>
      <p className="mt-[22px] flex flex-wrap items-center gap-x-[10px] rounded-[14px] bg-canvas px-[14px] py-3">
        <span className="text-label leading-[19.5px] text-ink-subtle">Google 계정</span>
        <span className="break-all text-body leading-6">{signup.email}</span>
      </p>
      {children}
    </>
  );
}
