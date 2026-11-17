"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/AuthProvider";
import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";
import { resetRetrospective, setRetrospectiveRest, startRetrospective } from "@/lib/retrospectiveApi";
import ResetRetrospectiveModal from "./ResetRetrospectiveModal";
import { getStepPath, useRetrospective } from "./RetrospectiveProvider";
import { getRequestErrorMessage } from "@/lib/requestErrorMessage";

// 시작 전: '시작하기 →', 작성 중: '이어 쓰기 →' + '처음부터'(R-05).
// 이어 쓰기는 마지막으로 저장한 단계(currentStep)로 간다(R-03). 과제 회고(R-23)도 같고, 휴회는 세션 회고에만 있다.
// 이슈 #117: '시작하기'는 서버에 회고를 만들지 않고 자료 화면만 연다. 회고는 처음 저장할 때 만들어진다(ensureStarted).
// 그래서 저장하지 않고 나가면 홈과 회고 화면 모두 '시작 전'으로 남는다.
export default function StartActions({ isAssignment = false }) {
  const router = useRouter();
  const { authenticatedRequest } = useAuth();
  const { week, session, retrospective, getStepHref, refreshCurrent, showToast } = useRetrospective();
  const [pending, setPending] = useState(null);
  const [error, setError] = useState("");
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isNavigating, startNavigation] = useTransition();
  const inFlight = useRef(false);
  const isWriting = retrospective.state === "IN_PROGRESS";
  const isCompleted = retrospective.state === "COMPLETED";

  async function run(kind, request, fallback) {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(kind);
    setError("");
    try {
      const result = await request({ request: authenticatedRequest });
      await refreshCurrent();
      setIsResetOpen(false);
      startNavigation(() => router.push(getStepHref(getStepPath(result.currentStep))));
    } catch (failure) {
      if (failure.status !== 401) setError(getRequestErrorMessage(failure, fallback));
    } finally {
      inFlight.current = false;
      setPending(null);
    }
  }

  function start() {
    setError("");
    startNavigation(() => router.push(getStepHref("materials")));
  }

  // 휴회(R-06). 시작 전이면 휴회로 회고를 만들고(API 12), 시작한 뒤면 휴회로 표시한다(API 15).
  // 상태가 RESTED로 바뀌면 시작 화면 대신 휴회 화면이 보인다.
  async function markRested() {
    if (isCompleted) return;
    if (inFlight.current) return;
    inFlight.current = true;
    setPending("rest");
    setError("");
    try {
      const options = { request: authenticatedRequest };
      await (session.id ? setRetrospectiveRest(session.id, true, options) : startRetrospective({ weekId: week.weekId, rested: true }, options));
      await refreshCurrent();
      showToast("이번 주는 휴회로 표시했어요");
    } catch (failure) {
      if (failure.status !== 401) setError(getRequestErrorMessage(failure, "휴회로 표시하지 못했어요. 잠시 후 다시 시도해 주세요."));
    } finally {
      inFlight.current = false;
      setPending(null);
    }
  }

  // 처음부터는 2단계 자료부터 빈 상태로 다시 쓴다(API 16 응답의 currentStep).
  function reset() {
    if (!isWriting || isCompleted) return;
    run("reset", (options) => resetRetrospective(retrospective.id, options), "작성한 내용을 지우지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  // 진한 시작 카드 안에 가운데 정렬로 놓인다(Figma '세션 회고 시작 카드'): 버튼 줄 아래에 휴회 링크.
  return (
    <div className="relative flex w-full flex-col items-center gap-4 pt-4">
      {isNavigating ? (
        <Button variant="soft" disabled aria-busy="true">시작하는 중…</Button>
      ) : isWriting ? (
        <div className="flex flex-wrap justify-center gap-3">
          {!isCompleted && <Button
            variant="inverse"
            className="min-w-0"
            disabled={pending !== null}
            onClick={() => { setError(""); setIsResetOpen(true); }}
          >
            처음부터
          </Button>}
          <Button
            variant="soft"
            className="min-w-0"
            href={getStepHref(getStepPath(retrospective.currentStep))}
          >
            이어 쓰기 →
          </Button>
        </div>
      ) : (
        <Button variant="soft" onClick={start} disabled={pending !== null}>시작하기 →</Button>
      )}
      {!isAssignment && !isCompleted && (
        <TextLink variant="inverse" onClick={markRested} disabled={pending !== null || isNavigating} aria-busy={pending === "rest"}>
          {pending === "rest" ? "휴회로 표시하는 중…" : "이번 주는 휴회했어요"}
        </TextLink>
      )}
      {error && !isResetOpen && <p role="alert" className="text-body-sm text-tint-red">{error}</p>}
      <ResetRetrospectiveModal
        open={isWriting && !isCompleted && isResetOpen}
        isResetting={pending === "reset"}
        error={isResetOpen ? error : ""}
        onCancel={() => setIsResetOpen(false)}
        onConfirm={reset}
      />
    </div>
  );
}
