"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import { useMockData } from "@/components/layout/MockDataProvider";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import Button from "@/components/ui/Button";
import { setRetrospectiveRest } from "@/lib/retrospectiveApi";
import { getRequestErrorMessage, useRetrospectivePreview } from "./RetrospectivePreview";

// 홈 화면은 아직 목업 상태를 보므로 휴회 해제 뒤 상태를 맞춘다. 홈 API(4번)를 연결하면 뺀다.
const HOME_WEEK_STATUS = { NOT_STARTED: "idle", IN_PROGRESS: "writing" };

export default function PausedRetrospective() {
  const { authenticatedRequest } = useAuth();
  const { setWeekStatus } = useMockData();
  const { week, session, refreshCurrent } = useRetrospectivePreview();
  const [isUndoing, setIsUndoing] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);

  // '휴회가 아니었어요'(R-06). 휴회 전 상태로 돌아가고 쓰던 내용은 그대로다(API 15).
  async function undoRest() {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsUndoing(true);
    setError("");
    try {
      const { state } = await setRetrospectiveRest(session.id, false, { request: authenticatedRequest });
      setWeekStatus(HOME_WEEK_STATUS[state] ?? "idle");
      await refreshCurrent();
    } catch (failure) {
      if (failure.status !== 401) setError(getRequestErrorMessage(failure, "휴회를 해제하지 못했어요. 잠시 후 다시 시도해 주세요."));
    } finally {
      inFlight.current = false;
      setIsUndoing(false);
    }
  }

  return (
    <section
      aria-labelledby="paused-title"
      className="mx-auto mt-6 flex w-full max-w-[620px] flex-col items-center gap-3.5 rounded-[24px] bg-white px-6 py-8 text-center sm:rounded-[32px] sm:px-8 sm:py-10"
    >
      <div className="relative size-[90px]" aria-hidden="true">
        <ShapeCharacter
          shape="semicircle"
          color="green"
          size={90}
          cropped
          className="absolute top-[34%] left-[6%]"
        />
      </div>
      <h2 id="paused-title" className="text-heading text-balance break-keep tracking-[-0.02em] sm:text-[24px]">
        {week.weekNumber}주차는 휴회로 표시했어요
      </h2>
      <p className="text-body text-balance break-keep text-ink-subtle">
        쉬어 가는 주예요. 회고와 과제를 쓰지 않아도 돼요.
      </p>
      <div className="flex w-full flex-col justify-center gap-2 sm:w-auto sm:flex-row">
        <Button href="/">홈으로</Button>
        <Button variant="secondary" onClick={undoRest} disabled={isUndoing} aria-busy={isUndoing}>
          {isUndoing ? "해제하는 중…" : "휴회가 아니었어요"}
        </Button>
      </div>
      {error && <p role="alert" className="text-body-sm text-error">{error}</p>}
    </section>
  );
}
