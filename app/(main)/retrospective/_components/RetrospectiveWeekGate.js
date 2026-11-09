"use client";

import { useMockData } from "@/components/layout/MockDataProvider";
import { useRetrospectivePreview } from "./RetrospectivePreview";

// 시작 화면에 들어왔을 때 이번 주가 이미 휴회나 완료면 그 화면을 먼저 보여 준다.
// 과제 회고는 세션 회고를 끝낸 뒤에도 쓸 수 있어 시작 화면을 그대로 둔다.
// 휴회(API 15)와 저장(API 20)을 연결하기 전까지는 목업 상태(weekStatus)도 함께 본다.
export default function RetrospectiveWeekGate({ isAssignment, paused, complete, children }) {
  const { weekStatus } = useMockData();
  const { session } = useRetrospectivePreview();

  if (weekStatus === "paused" || session.state === "RESTED") {
    return paused;
  }

  if (!isAssignment && (weekStatus === "done" || session.state === "COMPLETED")) {
    return complete;
  }

  return children;
}
