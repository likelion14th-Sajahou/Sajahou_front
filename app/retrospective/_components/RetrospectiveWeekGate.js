"use client";

import { useMockData } from "@/components/layout/MockDataProvider";

// 시작 화면에 들어왔을 때 이번 주가 이미 휴회나 완료면 그 화면을 먼저 보여 준다.
// 과제 회고는 세션 회고를 끝낸 뒤에도 쓸 수 있어 시작 화면을 그대로 둔다.
export default function RetrospectiveWeekGate({ isAssignment, paused, complete, children }) {
  const { weekStatus } = useMockData();

  if (weekStatus === "paused") {
    return paused;
  }

  if (weekStatus === "done" && !isAssignment) {
    return complete;
  }

  return children;
}
