"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/components/layout/AuthProvider";
import { useMockData } from "@/components/layout/MockDataProvider";
import Button from "@/components/ui/Button";
import DrawnBorder from "@/components/ui/DrawnBorder";
import { setRetrospectiveRest } from "@/lib/retrospectiveApi";
import { useRetrospectivePreview } from "./RetrospectivePreview";
import { getRequestErrorMessage } from "@/lib/requestErrorMessage";

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

  // 휴회 카드(Figma '[디] 02 … 데스크톱 1450'): 제목과 같은 896px, 진한 울퉁불퉁한 테두리, 밤하늘 구름 캐릭터.
  return (
    <section
      aria-labelledby="paused-title"
      className="relative mx-auto mt-10 flex w-full max-w-[896px] flex-col items-center gap-6 rounded-[32px] bg-white px-6 py-12 text-center sm:px-8 sm:py-14"
    >
      <DrawnBorder variant="paused-card" />
      <Image src="/images/characters/cloud-night-sky.png" alt="" width={166} height={111} />
      <div className="flex flex-col items-center gap-1.5">
        <h2 id="paused-title" className="font-display text-[24px] leading-[38.4px] tracking-[-0.48px] text-balance break-keep text-ink">
          {week.weekNumber}주차는 휴회로 표시했어요
        </h2>
        <p className="text-body leading-6 text-balance break-keep text-ink-subtle">
          쉬어 가는 주예요. 회고와 과제를 쓰지 않아도 돼요.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="ink" href="/">홈으로</Button>
        <Button variant="ink-outline" onClick={undoRest} disabled={isUndoing} aria-busy={isUndoing}>
          {isUndoing ? "해제하는 중…" : "휴회가 아니었어요"}
        </Button>
      </div>
      {error && <p role="alert" className="text-body-sm text-error">{error}</p>}
    </section>
  );
}
