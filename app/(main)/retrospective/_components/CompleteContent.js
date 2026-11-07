"use client";

import { useState } from "react";
import { useMockData } from "@/components/layout/MockDataProvider";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import TextLink from "@/components/ui/TextLink";
import { getWeekCardId } from "@/lib/mock/retrospective";
import RetrospectiveSteps from "./RetrospectiveSteps";
import { useRetrospectivePreview } from "./RetrospectivePreview";

export default function CompleteContent({ week, initialDraft, assignmentDueLabel }) {
  const { completedDraft, setCompletedDraft, setAssignmentStatus, assignmentPending, isAssignment } = useRetrospectivePreview();
  const { resetWeek } = useMockData();
  const [notice, setNotice] = useState("");

  async function copyRetrospective() {
    try {
      await navigator.clipboard.writeText((completedDraft ?? initialDraft).retrospective);
      setNotice("회고록을 복사했어요. 노션에 붙여 넣어 주세요.");
    } catch {
      setNotice("복사하지 못했어요. 브라우저의 클립보드 권한을 확인한 뒤 다시 시도해 주세요.");
    }
  }

  function restartDemo() {
    setCompletedDraft(null);
    setAssignmentStatus("record");
    resetWeek();
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
          <p className="text-label text-accent-strong">{week}주차 {isAssignment ? "과제" : "세션"} 회고 완료</p>
          <h2 id="retrospective-complete-title" className="text-[26px] leading-[1.6] tracking-[-0.02em]">사자록에 카드 1장을 저장했어요</h2>
          <p className="text-body text-ink-subtle">노션에 붙여넣기 했나요? 아직이면 지금 복사해 두세요.</p>
          <div className="flex justify-center gap-2 pt-1.5">
            <Button onClick={copyRetrospective}>회고록 복사</Button>
            <Button variant="secondary" href={`/my-record?card=${getWeekCardId(isAssignment)}`}>나의 사자록 보기</Button>
          </div>
          {assignmentPending && !isAssignment && (
            <div className="w-full pt-2">
              <div className="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left">
                <div className="min-w-0 flex-1">
                  <p className="text-body">과제 회고가 남았어요</p>
                  <p className="text-label leading-[1.5] text-ink-subtle">마감 {assignmentDueLabel} · 과제를 낸 뒤에 써요</p>
                </div>
                <Button size="sm" href="/retrospective?type=assignment">과제 회고 쓰기</Button>
              </div>
            </div>
          )}
          <TextLink href="/retrospective" onClick={restartDemo}>데모 처음부터 다시 보기</TextLink>
        </Card>
        <p role="status" className={notice ? "mt-3 text-body-sm text-ink-muted" : "sr-only"}>{notice}</p>
      </div>
    </>
  );
}
