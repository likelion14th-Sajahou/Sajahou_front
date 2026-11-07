"use client";

import { createContext, useContext, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMockData } from "@/components/layout/MockDataProvider";
import Chip from "@/components/ui/Chip";
import { PARTS } from "@/lib/mock/user";

const RetrospectivePreviewContext = createContext(null);

// 데모 파트와 과제 선택을 제목 영역과 자료 폼에서 함께 사용한다.
// 데모 파트는 목업 사용자의 파트라서, 바꾸면 상단 메뉴와 다른 화면의 역량 태그 목록도 함께 바뀐다.
// 실제 서비스에는 없는 시연용 기능이고, 서버 데이터는 변경하지 않는다.
export default function RetrospectivePreview({ children }) {
  const { user, setUserPart } = useMockData();
  const [assignmentStatus, setAssignmentStatus] = useState("record");
  const [completedDraft, setCompletedDraft] = useState(null);

  return (
    <RetrospectivePreviewContext value={{ part: user.part, setPart: setUserPart, assignmentStatus, setAssignmentStatus, completedDraft, setCompletedDraft }}>
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
  const searchParams = useSearchParams();
  // 화면 확인용 주소(?preview=assignment-pending)로 들어왔으면 세션 탭으로 돌아가도 탭이 보이도록 유지한다.
  const sessionHref = searchParams.get("preview") === "assignment-pending" ? "/retrospective?preview=assignment-pending" : "/retrospective";
  const sessionStatusLabel = (!isAssignment && isComplete) || completedDraft ? "완료" : "작성 중";
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
          <nav aria-label="회고 작성 상태" className="flex max-w-full flex-wrap gap-1.5 pt-2">
            {/* 세션 회고와 과제 회고를 오가는 전환 탭이다(R-01). */}
            <Chip selected={!isAssignment} href={sessionHref}>세션 회고 · {sessionStatusLabel}</Chip>
            <Chip selected={isAssignment} href="/retrospective?type=assignment">과제 회고 · {assignmentStatusLabel}</Chip>
          </nav>
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
