"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/layout/AuthProvider";
import { useMockData } from "@/components/layout/MockDataProvider";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import { formatDeadline } from "@/lib/formatDeadline";
import { PARTS } from "@/lib/mock/user";
import { getCurrentRetrospective } from "@/lib/retrospectiveApi";

const RetrospectivePreviewContext = createContext(null);

const LOAD_ERROR = "회고 상태를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.";

// API의 currentStep(2~4)과 화면 주소의 단계다. 1은 시작, 5는 저장이다(R-02).
const STEP_PATHS = { 2: "materials", 3: "questions", 4: "review" };

export function getStepPath(currentStep) {
  return STEP_PATHS[currentStep] ?? STEP_PATHS[2];
}

// 요청 실패 안내 문구다. 연결 문제와 그 밖의 실패만 나눈다.
export function getRequestErrorMessage(failure, fallback) {
  return failure?.kind === "timeout" || failure?.kind === "network"
    ? "연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요."
    : fallback;
}

// 이번 주 회고(API 11)를 불러와 제목·시작 화면·자료 단계가 함께 쓴다.
// 데모 파트와 과제 선택도 제목 영역과 자료 폼에서 함께 사용한다.
// 데모 파트는 목업 사용자의 파트라서, 바꾸면 상단 메뉴와 다른 화면의 역량 태그 목록도 함께 바뀐다.
// 실제 서비스에는 없는 시연용 기능이고, mock 응답의 마감일만 바뀐다. 실제 백엔드는 가입 파트를 쓴다.
export default function RetrospectivePreview({ children }) {
  const { user, setUserPart } = useMockData();
  const { authenticatedRequest } = useAuth();
  const [assignmentStatus, setAssignmentStatus] = useState("record");
  const [completedDraft, setCompletedDraft] = useState(null);
  const [{ current, error }, setLoadState] = useState({ current: null, error: "" });
  const [reloadKey, setReloadKey] = useState(0);

  // 파트를 바꾸면 그 파트의 마감일로 다시 불러온다.
  useEffect(() => {
    const controller = new AbortController();
    getCurrentRetrospective({ signal: controller.signal, request: authenticatedRequest })
      .then((result) => setLoadState({ current: result, error: "" }))
      .catch((failure) => {
        if (controller.signal.aborted || failure.name === "AbortError") return;
        setLoadState((previous) => ({ ...previous, error: LOAD_ERROR }));
      });
    return () => controller.abort();
  }, [authenticatedRequest, user.part, reloadKey]);

  // 시작·처음부터처럼 상태를 바꾼 뒤에 부른다. 새 상태를 받은 다음 화면을 옮겨야 다음 단계가 옛 값을 보지 않는다.
  async function refreshCurrent() {
    const result = await getCurrentRetrospective({ request: authenticatedRequest });
    setLoadState({ current: result, error: "" });
    return result;
  }

  if (!current) {
    return error ? (
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <p role="alert" className="text-body-sm text-error">{error}</p>
        <Button size="sm" variant="secondary" onClick={() => { setLoadState({ current: null, error: "" }); setReloadKey((key) => key + 1); }}>다시 시도</Button>
      </div>
    ) : (
      <p role="status" className="mt-6 text-body-sm text-ink-muted">회고 상태를 불러오는 중이에요.</p>
    );
  }

  const value = {
    part: user.part,
    setPart: setUserPart,
    assignmentStatus,
    setAssignmentStatus,
    completedDraft,
    setCompletedDraft,
    week: current.week,
    session: current.session,
    deadlineLabels: {
      session: formatDeadline(current.week.sessionDeadline),
      assignment: formatDeadline(current.week.assignmentDeadline),
    },
    refreshCurrent,
  };

  return (
    <RetrospectivePreviewContext value={value}>
      {error && <p role="alert" className="mb-4 text-body-sm text-error">{error}</p>}
      {children}
    </RetrospectivePreviewContext>
  );
}

export function useRetrospectivePreview() {
  const context = useContext(RetrospectivePreviewContext);
  const searchParams = useSearchParams();
  const isAssignment = searchParams.get("type") === "assignment";

  // 화면 이동 시 회고 종류를 유지한다. 실제 API 요청 경로와는 무관한 화면 주소다.
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

export function RetrospectiveHeading() {
  const { week, part, setPart, assignmentPending, isAssignment, isComplete, isStarted, completedDraft } = useRetrospectivePreview();
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
          {week.weekNumber}주차 {isAssignment ? "과제" : "세션"} 회고
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
