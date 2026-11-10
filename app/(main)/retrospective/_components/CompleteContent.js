"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/AuthProvider";
import { useMockData } from "@/components/layout/MockDataProvider";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import TextLink from "@/components/ui/TextLink";
import { getAuthMode } from "@/lib/authConfig";
import { formatDeadline } from "@/lib/formatDate";
import { getRetrospective } from "@/lib/retrospectiveApi";
import RetrospectiveSteps from "./RetrospectiveSteps";
import { useRetrospectivePreview } from "./RetrospectivePreview";
import { copyText } from "@/lib/clipboard";

// 5단계 완료(R-22, 06·06-a). 저장한 회고의 회고록을 복사하고, 공개된 카드를 나의 사자록에서 열 수 있다.
// 과제를 '나중에 쓸게요'로 고른 주에 아직 과제 회고가 남았으면 마감과 '과제 회고 쓰기'를 보여 준다.
export default function CompleteContent() {
  const router = useRouter();
  const { authenticatedRequest } = useAuth();
  const { user, setWeekStatus } = useMockData();
  const { week, session, openAssignments, setAssignmentStatus, isAssignment, refreshCurrent } = useRetrospectivePreview();
  const [card, setCard] = useState(null);
  const [notice, setNotice] = useState("");
  // 과제 회고는 과제 회고 분기 커밋에서 연결한다.
  const retrospectiveId = isAssignment ? null : session.id;
  const pendingAssignment = !isAssignment && session.assignmentMode === "LATER" ? openAssignments[0] : null;

  useEffect(() => {
    if (!retrospectiveId) return;
    const controller = new AbortController();
    getRetrospective(retrospectiveId, { signal: controller.signal, request: authenticatedRequest })
      .then((detail) => setCard(detail.card))
      .catch((failure) => {
        if (!controller.signal.aborted && failure.status !== 401) setNotice("저장한 회고록을 불러오지 못했어요. 나의 사자록에서 카드를 확인해 주세요.");
      });
    return () => controller.abort();
  }, [retrospectiveId, authenticatedRequest]);

  async function copyRetrospective() {
    const copied = await copyText(card.fullMarkdown);
    setNotice(copied ? "회고록을 복사했어요. 노션에 붙여 넣어 주세요." : "복사하지 못했어요. 브라우저의 클립보드 권한을 확인한 뒤 다시 시도해 주세요.");
  }

  // 시연용으로 이번 주를 처음 상태로 돌린다. 실제 서비스에는 없는 동작이라 mock 모드에서만 보인다.
  async function restartDemo() {
    const { resetMockWeek } = await import("@/lib/mock/demoReset");
    resetMockWeek(window.localStorage, user.id);
    setAssignmentStatus("record");
    setWeekStatus("idle");
    await refreshCurrent();
    router.push("/retrospective");
  }

  return (
    <>
      <RetrospectiveSteps currentStep={4} />
      <div className="mt-7 flex flex-col items-center">
        <Card as="section" size="md" className="flex w-[620px] flex-col items-center gap-3.5 rounded-[32px]! px-8! py-10! text-center" aria-labelledby="retrospective-complete-title">
          <div aria-hidden="true" className="relative h-[120px] w-[180px]">
            <ShapeCharacter shape="sunFine" color="yellow" size={96} cropped className="absolute top-[2.88px] left-[49.552px]" />
            <ShapeCharacter shape="triangle" color="coral" size={32} face="none" cropped className="absolute top-[32.56px] left-[1.92px]" />
            <ShapeCharacter shape="square" color="green" size={26} face="none" cropped className="absolute top-[86.08px] left-[156.08px]" />
          </div>
          <p className="text-label text-accent-strong">{week.weekNumber}주차 {isAssignment ? "과제" : "세션"} 회고 완료</p>
          <h2 id="retrospective-complete-title" className="text-[26px] leading-[1.6] tracking-[-0.02em]">사자록에 카드 1장을 저장했어요</h2>
          <p className="text-body text-ink-subtle">노션에 붙여넣기 했나요? 아직이면 지금 복사해 두세요.</p>
          <div className="flex justify-center gap-2 pt-1.5">
            <Button onClick={copyRetrospective} disabled={!card}>회고록 복사</Button>
            <Button variant="secondary" href={card ? `/my-record?card=${card.cardId}` : "/my-record"}>나의 사자록 보기</Button>
          </div>
          {pendingAssignment && (
            <div className="w-full pt-2">
              <div className="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left">
                <div className="min-w-0 flex-1">
                  <p className="text-body">과제 회고가 남았어요</p>
                  <p className="text-label leading-[1.5] text-ink-subtle">마감 {formatDeadline(pendingAssignment.deadline)} · 과제를 낸 뒤에 써요</p>
                </div>
                <Button size="sm" href="/retrospective?type=assignment">과제 회고 쓰기</Button>
              </div>
            </div>
          )}
          {getAuthMode() === "mock" && <TextLink onClick={restartDemo}>데모 처음부터 다시 보기</TextLink>}
        </Card>
        <p role="status" className={notice ? "mt-3 text-body-sm text-ink-muted" : "sr-only"}>{notice}</p>
      </div>
    </>
  );
}
