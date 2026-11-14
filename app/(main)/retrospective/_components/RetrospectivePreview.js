"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/layout/AuthProvider";
import { useMockData } from "@/components/layout/MockDataProvider";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import Toast, { useToast } from "@/components/ui/Toast";
import { formatDeadline } from "@/lib/formatDate";
import { getCurrentRetrospective } from "@/lib/retrospectiveApi";

const RetrospectivePreviewContext = createContext(null);

const STATE_LABELS = { NOT_STARTED: "시작 전", IN_PROGRESS: "작성 중", COMPLETED: "완료", RESTED: "휴회" };

const LOAD_ERROR = "회고 상태를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.";

// API의 currentStep(2~4)과 화면 주소의 단계다. 1은 시작, 5는 저장이다(R-02).
const STEP_PATHS = { 2: "materials", 3: "questions", 4: "review" };

export function getStepPath(currentStep) {
  return STEP_PATHS[currentStep] ?? STEP_PATHS[2];
}

// 이번 주 회고(API 11)를 불러온다. 과제를 '나중에 쓸게요'로 고른 주면 과제 회고(R-23)도 함께 갖춘다.
// openAssignments에는 지각 허용 기간(마감 + 7일)이 남은 과제 회고가 주차 오름차순으로 오고, 끝낸 것도 COMPLETED로 남는다.
// 이 화면은 이번 주차 과제 회고만 다룬다. 지난주 것은 쓰지 않는다.
// 시작 전이면 id·currentStep·lastSavedAt이 null이라 단계는 1(시작)로 본다.
async function loadCurrent({ signal, request }) {
  const current = await getCurrentRetrospective({ signal, request });
  const open = current.openAssignments.find(({ weekNumber }) => weekNumber === current.week.weekNumber);
  const assignment = open
    ? { id: open.id, state: open.state, currentStep: open.currentStep ?? 1, lastSavedAt: open.lastSavedAt, deadline: open.deadline }
    : null;
  return { ...current, assignment };
}

// 제목·시작 화면·단계 화면이 함께 쓴다. 과제 선택도 제목 영역과 자료 폼에서 함께 사용한다.
// 파트는 가입 때 고른 사용자 파트다. 파트에 따라 마감일이 다르다.
export default function RetrospectivePreview({ children }) {
  const { user } = useMockData();
  const { authenticatedRequest } = useAuth();
  const [assignmentStatus, setAssignmentStatus] = useState("record");
  const [{ current, error }, setLoadState] = useState({ current: null, error: "" });
  const [reloadKey, setReloadKey] = useState(0);
  // 시작 화면이 휴회 화면으로 바뀌어도 토스트가 남도록 여기에 둔다(C-02).
  const { toast, showToast, hideToast } = useToast();

  // 파트를 바꾸면 그 파트의 마감일로 다시 불러온다.
  useEffect(() => {
    const controller = new AbortController();
    loadCurrent({ signal: controller.signal, request: authenticatedRequest })
      .then((result) => setLoadState({ current: result, error: "" }))
      .catch((failure) => {
        if (controller.signal.aborted || failure.name === "AbortError") return;
        setLoadState((previous) => ({ ...previous, error: LOAD_ERROR }));
      });
    return () => controller.abort();
  }, [authenticatedRequest, user.part, reloadKey]);

  // 시작·처음부터처럼 상태를 바꾼 뒤에 부른다. 새 상태를 받은 다음 화면을 옮겨야 다음 단계가 옛 값을 보지 않는다.
  async function refreshCurrent() {
    const result = await loadCurrent({ request: authenticatedRequest });
    setLoadState({ current: result, error: "" });
    return result;
  }

  // 임시 저장(API 14) 응답으로 단계·저장 시각을 바로 반영한다. 시작 화면의 '이어 쓰기'가 이 단계로 간다.
  function applySaved({ id, state, currentStep, lastSavedAt }) {
    setLoadState((previous) => {
      const key = previous.current.assignment?.id === id ? "assignment" : "session";
      return { ...previous, current: { ...previous.current, [key]: { ...previous.current[key], state, currentStep, lastSavedAt } } };
    });
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
    assignmentStatus,
    setAssignmentStatus,
    week: current.week,
    session: current.session,
    assignment: current.assignment,
    deadlineLabels: {
      session: formatDeadline(current.week.sessionDeadline),
      assignment: formatDeadline(current.week.assignmentDeadline),
    },
    refreshCurrent,
    applySaved,
    showToast,
  };

  return (
    <RetrospectivePreviewContext value={value}>
      {error && <p role="alert" className="mb-4 text-body-sm text-error">{error}</p>}
      {children}
      <Toast toast={toast} onDismiss={hideToast} />
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
    // 지금 보는 회고: 과제 회고 주소(?type=assignment)면 과제 회고, 아니면 세션 회고다.
    retrospective: isAssignment ? context.assignment : context.session,
    getStepHref,
    // 과제를 '나중에 쓸게요'로 골랐으면(화면에서 막 골랐거나 저장된 값) 세션·과제 전환 탭을 보여 준다(R-01).
    assignmentPending: context.assignmentStatus === "later" || context.session.assignmentMode === "LATER",
  };
}

export function RetrospectiveHeading() {
  const { week, session, assignment, part, assignmentPending, isAssignment } = useRetrospectivePreview();
  // 시작 화면(시작 전·작성 중·휴회)은 Figma대로 896px 가운데 정렬이다. 다른 단계 화면은 아직 디자인 전이라 본문 폭 그대로 둔다.
  const isStartScreen = !useSearchParams().get("step");

  return (
    <div className={`flex flex-wrap items-end justify-between gap-x-6 gap-y-3.5 ${isStartScreen ? "mx-auto max-w-[896px]" : ""}`}>
      {/* 회고 상단 헤더(Figma '회고 상단 헤더'): 홈 링크, 파트, 제목은 삼립호빵체 */}
      <div className="flex min-w-0 max-w-full flex-col items-start gap-3">
        <Link href="/" className="font-display text-body-sm leading-[22.4px] text-ink-muted">← 홈</Link>
        <div className="flex flex-col items-start font-display">
          <p className="text-label leading-[20.8px] text-accent-strong">{part}</p>
          <h1 className="text-[32px] leading-[45.6px] tracking-[-0.76px] text-balance">
            {week.weekNumber}주차 {isAssignment ? "과제" : "세션"} 회고
          </h1>
        </div>
        {/* 과제 회고가 따로 없는 주(기록하기·없음)에는 탭을 보이지 않는다. */}
        {(assignmentPending || (isAssignment && assignment)) && (
          <nav aria-label="회고 작성 상태" className="flex max-w-full flex-wrap gap-1.5 pt-2">
            {/* 세션 회고와 과제 회고를 오가는 전환 탭이다(R-01). 탭도 버튼이라 삼립호빵체다. */}
            <Chip className="font-display" selected={!isAssignment} href="/retrospective">세션 회고 · {STATE_LABELS[session.state]}</Chip>
            <Chip className="font-display" selected={isAssignment} href="/retrospective?type=assignment">과제 회고 · {STATE_LABELS[assignment?.state ?? "NOT_STARTED"]}</Chip>
          </nav>
        )}
      </div>
    </div>
  );
}
