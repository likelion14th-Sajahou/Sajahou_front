"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import { getStoryCards } from "@/lib/myRecordApi";

// 내 스토리 카드 수. 나의 사자록 탭과 같은 스토리 카드 목록(21번)의 totalCount를 쓴다.
// 로그인 전이거나 아직 불러오지 못했으면 '—'를 보여 준다.
export default function StoryCardCount() {
  const { isAuthenticated, authenticatedRequest } = useAuth();
  const [count, setCount] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const controller = new AbortController();
    getStoryCards({}, { signal: controller.signal, request: authenticatedRequest })
      .then(({ totalCount }) => setCount(totalCount))
      // 숫자 하나라 실패해도 화면을 막지 않고 '—'로 둔다.
      .catch(() => {});
    return () => controller.abort();
  }, [isAuthenticated, authenticatedRequest]);

  return <p className="text-[30px] leading-9">{isAuthenticated && count !== null ? count : "—"}</p>;
}
