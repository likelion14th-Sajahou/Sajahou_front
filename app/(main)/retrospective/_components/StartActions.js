"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/AuthProvider";
import { useMockData } from "@/components/layout/MockDataProvider";
import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";
import { resetRetrospective, setRetrospectiveRest, startRetrospective } from "@/lib/retrospectiveApi";
import ResetRetrospectiveModal from "./ResetRetrospectiveModal";
import { getStepPath, useRetrospectivePreview } from "./RetrospectivePreview";
import { getRequestErrorMessage } from "@/lib/requestErrorMessage";

// 시작 전: '시작하기 →', 작성 중: '이어 쓰기 →' + '처음부터'(R-05).
// 이어 쓰기는 마지막으로 저장한 단계(currentStep)로 간다(R-03). 과제 회고(R-23)도 같고, 휴회는 세션 회고에만 있다.
export default function StartActions({ isAssignment = false }) {
  const router = useRouter();
  const { authenticatedRequest } = useAuth();
  const { setWeekStatus } = useMockData();
  const { week, session, retrospective, getStepHref, refreshCurrent, showToast } = useRetrospectivePreview();
  const [pending, setPending] = useState(null);
  const [error, setError] = useState("");
  const [isResetOpen, setIsResetOpen] = useState(false);
  const inFlight = useRef(false);
  const isWriting = retrospective.state === "IN_PROGRESS";

  async function run(kind, request, fallback) {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(kind);
    setError("");
    try {
      const result = await request({ request: authenticatedRequest });
      await refreshCurrent();
      // 홈 화면은 아직 목업 상태를 보므로 세션 회고면 함께 바꾼다. 홈 API(4번)를 연결하면 뺀다.
      if (!isAssignment) setWeekStatus("writing");
      setIsResetOpen(false);
      router.push(getStepHref(getStepPath(result.currentStep)));
    } catch (failure) {
      if (failure.status !== 401) setError(getRequestErrorMessage(failure, fallback));
    } finally {
      inFlight.current = false;
      setPending(null);
    }
  }

  function start() {
    run("start", (options) => startRetrospective({ weekId: week.weekId, type: isAssignment ? "ASSIGNMENT" : "SESSION" }, options), "회고를 시작하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  // 휴회(R-06). 시작 전이면 휴회로 회고를 만들고(API 12), 시작한 뒤면 휴회로 표시한다(API 15).
  // 상태가 RESTED로 바뀌면 시작 화면 대신 휴회 화면이 보인다.
  async function markRested() {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending("rest");
    setError("");
    try {
      const options = { request: authenticatedRequest };
      await (session.id ? setRetrospectiveRest(session.id, true, options) : startRetrospective({ weekId: week.weekId, rested: true }, options));
      await refreshCurrent();
      // 홈 화면은 아직 목업 상태를 보므로 함께 바꾼다. 홈 API(4번)를 연결하면 뺀다.
      setWeekStatus("paused");
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
    run("reset", (options) => resetRetrospective(retrospective.id, options), "작성한 내용을 지우지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  return (
    <div className="mt-5 border-t border-line pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3.5">
        {!isAssignment && (
          <TextLink onClick={markRested} disabled={pending === "rest"} aria-busy={pending === "rest"}>
            {pending === "rest" ? "휴회로 표시하는 중…" : "이번 주는 휴회했어요"}
          </TextLink>
        )}
        {isWriting ? (
          <div className="grid w-full grid-cols-2 gap-2 sm:ml-auto sm:flex sm:w-auto">
            <Button
              variant="secondary"
              className="min-w-0 max-sm:px-3"
              onClick={() => { setError(""); setIsResetOpen(true); }}
            >
              처음부터
            </Button>
            <Button
              variant="accent"
              className="min-w-0 max-sm:px-3"
              href={getStepHref(getStepPath(retrospective.currentStep))}
              onClick={() => { if (!isAssignment) setWeekStatus("writing"); }}
            >
              이어 쓰기 →
            </Button>
          </div>
        ) : (
          <Button className="ml-auto" onClick={start} disabled={pending === "start"} aria-busy={pending === "start"}>
            {pending === "start" ? "시작하는 중…" : "시작하기 →"}
          </Button>
        )}
      </div>
      {error && !isResetOpen && <p role="alert" className="mt-3 text-body-sm text-error">{error}</p>}
      <ResetRetrospectiveModal
        open={isResetOpen}
        isResetting={pending === "reset"}
        error={isResetOpen ? error : ""}
        onCancel={() => setIsResetOpen(false)}
        onConfirm={reset}
      />
    </div>
  );
}
