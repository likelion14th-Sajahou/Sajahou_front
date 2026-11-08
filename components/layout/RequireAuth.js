"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthRestoreStatus, useAuth } from "./AuthProvider";

// 화면 진입 UX만 제어한다. API 데이터의 실제 권한 검사는 백엔드에서 수행한다.
export default function RequireAuth({ children }) {
  const { isAuthenticated, restoreStatus } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (restoreStatus === "ready" && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, restoreStatus, router]);
  if (restoreStatus !== "ready") return <AuthRestoreStatus className="min-h-screen px-4" />;
  return isAuthenticated ? children : null;
}
