"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import TextLink from "@/components/ui/TextLink";
import RetrospectiveSteps from "./RetrospectiveSteps";
import { useRetrospectivePreview } from "./RetrospectivePreview";

export default function CompleteContent({ week, initialDraft }) {
  const { completedDraft, setCompletedDraft, setAssignmentStatus } = useRetrospectivePreview();
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
          <p className="text-label text-accent-strong">{week}주차 세션 회고 완료</p>
          <h2 id="retrospective-complete-title" className="text-[26px] leading-[1.6] tracking-[-0.02em]">사자록에 카드 1장을 저장했어요</h2>
          <p className="text-body text-ink-subtle">노션에 붙여넣기 했나요? 아직이면 지금 복사해 두세요.</p>
          <div className="flex justify-center gap-2 pt-1.5">
            <Button onClick={copyRetrospective}>회고록 복사</Button>
            <Button variant="secondary" onClick={() => setNotice("나의 사자록 화면은 준비 중이에요.")}>나의 사자록 보기</Button>
          </div>
          <TextLink href="/retrospective" onClick={restartDemo}>데모 처음부터 다시 보기</TextLink>
        </Card>
        <p role="status" className={notice ? "mt-3 text-body-sm text-ink-muted" : "sr-only"}>{notice}</p>
      </div>
    </>
  );
}
