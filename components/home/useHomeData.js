"use client";

import { useCallback } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import { getProjectHome } from "@/lib/projectApi";
import { getFootprints } from "@/lib/myRecordApi";
import useRecordResource from "@/components/my-record/useRecordResource";

// 홈에 진입할 때 다시 조회한다. 화면용 Mock과 실제 API 모두 같은 요청 경로를 쓴다.
export default function useHomeData() {
  const { user, authenticatedRequest } = useAuth();
  const load = useCallback(async (signal) => {
    const options = { signal, request: authenticatedRequest };
    const [home, footprints] = await Promise.all([getProjectHome(options), getFootprints(options)]);
    return { ...home, footprints };
  }, [authenticatedRequest]);
  return useRecordResource(load, user ? String(user.id) : null);
}
