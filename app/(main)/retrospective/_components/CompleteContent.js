"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/AuthProvider";
import { useMockData } from "@/components/layout/MockDataProvider";
import Button from "@/components/ui/Button";
import Image from "next/image";
import TextLink from "@/components/ui/TextLink";
import Toast, { useToast } from "@/components/ui/Toast";
import { getAuthMode } from "@/lib/authConfig";
import { formatDeadline } from "@/lib/formatDate";
import { getRetrospective } from "@/lib/retrospectiveApi";
import RetroResultCard from "./RetroResultCard";
import RetrospectiveSteps from "./RetrospectiveSteps";
import { useRetrospectivePreview } from "./RetrospectivePreview";
import { copyText } from "@/lib/clipboard";

// 5단계 완료(R-22, 06·06-a). 저장한 회고의 회고록을 복사하고, 공개된 카드를 나의 사자록에서 열 수 있다.
// 과제를 '나중에 쓸게요'로 고른 주에 아직 과제 회고가 남았으면 마감과 '과제 회고 쓰기'를 보여 준다.
export default function CompleteContent() {
  const router = useRouter();
  const { authenticatedRequest, isDemo } = useAuth();
  const { user, setWeekStatus } = useMockData();
  const { week, assignment, retrospective, setAssignmentStatus, isAssignment, refreshCurrent } = useRetrospectivePreview();
  const [card, setCard] = useState(null);
  const [notice, setNotice] = useState("");
  const { toast, showToast, hideToast } = useToast();
  const retrospectiveId = retrospective?.id;
  const canRestartDemo = isDemo && getAuthMode() === "mock";
  // 세션 회고를 끝냈고 과제 회고가 아직 남았을 때만 보여 준다.
  const pendingAssignment = !isAssignment && assignment && assignment.state !== "COMPLETED" ? assignment : null;

  // 저장한 회고의 카드(회고록)를 회고 상세(API 13)에서 가져온다. 끝낸 과제 회고도 이번 주 회고 조회(API 11)에 id가 남는다.
  useEffect(() => {
    if (!retrospectiveId) return;
    const controller = new AbortController();
    getRetrospective(retrospectiveId, { signal: controller.signal, request: authenticatedRequest })
      .then(({ card: saved }) => setCard(saved))
      .catch((failure) => {
        if (!controller.signal.aborted && failure.status !== 401) setNotice("저장한 회고록을 불러오지 못했어요. 나의 사자록에서 카드를 확인해 주세요.");
      });
    return () => controller.abort();
  }, [retrospectiveId, authenticatedRequest]);

  async function copyRetrospective() {
    const copied = await copyText(card.fullMarkdown);
    showToast(copied ? "회고록을 복사했어요. 노션에 붙여 넣어 주세요." : "복사하지 못했어요. 나의 사자록에서 회고록을 열어 직접 선택해서 복사해 주세요.");
  }

  // mock 데이터를 지우는 개발용 동작이다. mock 모드의 데모 세션에서만 제공한다.
  async function restartDemo() {
    if (!canRestartDemo) return;
    const { resetMockWeek } = await import("@/lib/mock/demoReset");
    resetMockWeek(window.localStorage, user.id);
    setAssignmentStatus("record");
    setWeekStatus("idle");
    await refreshCurrent();
    router.push("/retrospective");
  }

  // 완료 카드(11/13 디자인): 620px 흰 카드, 진한 손그림 테두리, 반짝이는 구름 캐릭터.
  return (
    <>
      {/* 제목·단계·카드 사이 간격은 앞 단계 화면들과 같다(프로토타입 11/13). */}
      <RetrospectiveSteps currentStep={4} className="mt-[38px]" />
      <RetroResultCard titleId="retrospective-complete-title" className="mt-10 max-w-[620px] gap-3 px-8 pt-12 pb-10">
        <Image src="/images/characters/cloud-done.png" alt="" width={150} height={113} className="done-pop mb-3" />
        <p className="text-body-sm leading-[21px] font-bold text-ink-subtle">{week.weekNumber}주차 {isAssignment ? "과제" : "세션"} 회고 완료</p>
        <h2 id="retrospective-complete-title" className="font-display text-[24px] leading-[39px] tracking-[-0.48px] text-balance break-keep text-ink-strong">사자록에 카드 1장을 저장했어요</h2>
        <p className="text-body leading-6 text-balance break-keep text-ink-subtle">노션에 붙여넣기 했나요? 아직이면 지금 복사해 두세요.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          <Button variant="ink" onClick={copyRetrospective} disabled={!card}>회고록 복사</Button>
          <Button variant="ink-outline" href={card ? `/my-record?card=${card.cardId}` : "/my-record"}>나의 사자록 보기</Button>
        </div>
        {pendingAssignment && (
          <div className="mt-1 flex w-full flex-wrap items-center gap-3 rounded-2xl bg-canvas p-4 text-left">
            <div className="flex min-w-[200px] flex-1 flex-col gap-0.5">
              <p className="font-display text-body leading-6 text-ink-strong">과제 회고가 남았어요</p>
              <p className="text-label leading-5 text-ink-subtle">마감 {formatDeadline(pendingAssignment.deadline)} · 과제를 낸 뒤에 써요</p>
            </div>
            <Button variant="cta" href="/retrospective?type=assignment">과제 회고 쓰기 →</Button>
          </div>
        )}
        {canRestartDemo && <TextLink className="mt-2" onClick={restartDemo}>데모 처음부터 다시 보기</TextLink>}
      </RetroResultCard>
      <p role="status" className={notice ? "mt-3 text-center text-body-sm text-ink-muted" : "sr-only"}>{notice}</p>
      <Toast toast={toast} onDismiss={hideToast} />
    </>
  );
}
