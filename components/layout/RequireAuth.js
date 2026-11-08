"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthRestoreStatus, useAuth } from "./AuthProvider";

// 페이지 전체가 아닌 개인 콘텐츠를 감싼다. API 권한 검사는 백엔드에서 수행한다.
export default function RequireAuth({ children, className = "min-h-[240px] py-8" }) {
  const { isAuthenticated, restoreStatus } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (restoreStatus === "ready" && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, restoreStatus, router]);
  if (restoreStatus !== "ready") return <AuthRestoreStatus className={className} />;
  return isAuthenticated ? children : null;
}
