"use client";

import { useCallback } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import { getHome } from "@/lib/homeApi";
import { getFootprints } from "@/lib/myRecordApi";
import useApiResource from "@/components/ui/useApiResource";

// 홈에 진입할 때 백엔드 데이터를 다시 조회한다.
export default function useHomeData() {
  const { user, authenticatedRequest } = useAuth();
  const load = useCallback(async (signal) => {
    const options = { signal, request: authenticatedRequest };
    const [home, footprints] = await Promise.all([getHome(options), getFootprints(options)]);
    return { ...home, footprints };
  }, [authenticatedRequest]);
  return useApiResource(load, user ? String(user.id) : null);
}
