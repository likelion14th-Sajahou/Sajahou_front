"use client";

import { createContext, useContext, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Chip from "@/components/ui/Chip";

const RetrospectivePreviewContext = createContext(null);
const PARTS = ["기획·디자인", "프론트엔드", "백엔드"];

// 데모 파트와 과제 선택을 제목 영역과 자료 폼에서 함께 사용한다.
// 로그인한 사용자의 실제 파트나 서버 데이터는 변경하지 않는다.
export default function RetrospectivePreview({ initialPart, children }) {
  const [part, setPart] = useState(initialPart);
  const [assignmentStatus, setAssignmentStatus] = useState("record");
  const [completedDraft, setCompletedDraft] = useState(null);

  return (
    <RetrospectivePreviewContext value={{ part, setPart, assignmentStatus, setAssignmentStatus, completedDraft, setCompletedDraft }}>
      {children}
    </RetrospectivePreviewContext>
  );
}

export function useRetrospectivePreview() {
  const context = useContext(RetrospectivePreviewContext);
  const searchParams = useSearchParams();
  const isAssignment = searchParams.get("type") === "assignment";

  // 화면 이동 시 회고 종류를 유지한다. 실제 API 요청 경로와는 무관한 데모 URL이다.
  function getStepHref(step) {
    const params = new URLSearchParams();
    if (step) params.set("step", step);
    if (isAssignment) params.set("type", "assignment");
    return `/retrospective${params.size ? `?${params}` : ""}`;
  }

  return {
    ...context,
    isAssignment,
    getStepHref,
    isStarted: Boolean(searchParams.get("step")),
    isComplete: searchParams.get("step") === "complete",
    assignmentPending: context.assignmentStatus === "later" || searchParams.get("preview") === "assignment-pending",
  };
}

export function RetrospectiveHeading({ week }) {
  const { part, setPart, assignmentPending, isAssignment, isComplete, isStarted, completedDraft } = useRetrospectivePreview();
  const sessionStatusLabel = isComplete || isAssignment || completedDraft ? "완료" : "작성 중";
  const assignmentStatusLabel = !isAssignment || !isStarted ? "시작 전" : isComplete ? "완료" : "작성 중";

  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3.5">
      <div className="flex min-w-0 max-w-full flex-col items-start gap-1.5">
        <Link href="/" className="text-body-sm text-ink-muted">← 홈</Link>
        <p className="text-label text-accent-strong">{part}</p>
        <h1 className="text-[38px] leading-[1.2] tracking-[-0.02em]">
          {week}주차 {isAssignment ? "과제" : "세션"} 회고
        </h1>
        {(assignmentPending || isAssignment) && (
          <div aria-label="회고 작성 상태" className="flex max-w-full flex-wrap gap-1.5 pt-2">
            <Chip selected={!isAssignment} disabled className="disabled:cursor-default">세션 회고 · {sessionStatusLabel}</Chip>
            <Chip selected={isAssignment} disabled className="disabled:cursor-default">과제 회고 · {assignmentStatusLabel}</Chip>
          </div>
        )}
      </div>
      <div className="flex min-w-0 max-w-full flex-col items-end gap-1.5">
        <p className="text-label text-ink-subtle">데모 · 파트 바꿔 보기</p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="파트 미리보기">
          {PARTS.map((item) => (
            <Chip key={item} selected={item === part} onClick={() => setPart(item)}>{item}</Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
