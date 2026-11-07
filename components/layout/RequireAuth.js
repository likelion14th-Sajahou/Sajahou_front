"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

// 화면 진입 UX만 제어한다. API 데이터의 실제 권한 검사는 백엔드에서 수행한다.
export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);
  return isAuthenticated ? children : null;
}
