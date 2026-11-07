"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { MOCK_PORTFOLIO_GAPS } from "@/lib/mock/projects";
import AiQuestionForm from "./AiQuestionForm";
import PortfolioArtifactRequest from "./PortfolioArtifactRequest";
import SidebarTitle from "./SidebarTitle";

const GAP_STATUS = {
  current: { label: "지금", className: "bg-[#fff0e6]" },
  filled: { label: "채움 ✓", className: "bg-canvas opacity-70" },
  skipped: { label: "건너뜀", className: "bg-canvas opacity-70" },
  waiting: { label: "대기", className: "bg-canvas" },
};

function GapCategory({ gap }) {
  return <Badge tone={gap.tone} size="sm">{gap.category}</Badge>;
}

function GapList({ gaps, getStatus }) {
  return (
    <Card as="aside" size="md" aria-label="AI가 찾은 빈 곳">
      <SidebarTitle shape="triangle" color="coral" size={16}>AI가 찾은 빈 곳</SidebarTitle>
      <ol className="flex flex-col gap-2 pt-4">
        {gaps.map((gap, index) => {
          const { label, className } = GAP_STATUS[getStatus(gap, index)];

          return (
            <li key={gap.id} className={`flex flex-col items-start gap-1 rounded-xl px-3 py-2.5 ${className}`}>
              <GapCategory gap={gap} />
              <p className="text-[13.5px] leading-[21.6px] text-ink">{gap.gap}</p>
              <p className="text-label leading-[19.5px] text-ink-subtle">{label}</p>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

// 첫 질문은 '← 기록 고르기', 다음부터 '← 이전 질문'(H-17). 포트폴리오에서 '← 이전 질문으로'로 오면 마지막 질문부터 보여 준다(H-18).
export default function PortfolioGapFill({ initialFilled, startAtLast = false, onBackToRecords, onComplete }) {
  const gaps = MOCK_PORTFOLIO_GAPS;
  const [index, setIndex] = useState(startAtLast ? gaps.length - 1 : 0);
  const [filled, setFilled] = useState(initialFilled);
  const gap = gaps[index];
  const progress = `${index + 1} / ${gaps.length}`;

  function goNext(nextFilled) {
    if (index === gaps.length - 1) {
      onComplete(nextFilled);
      return;
    }

    setFilled(nextFilled);
    setIndex(index + 1);
  }

  const backProps = {
    backLabel: index === 0 ? "← 기록 고르기" : "← 이전 질문",
    onBack: index === 0 ? onBackToRecords : () => setIndex(index - 1),
  };

  function getStatus({ id }, gapIndex) {
    if (gapIndex === index) {
      return "current";
    }

    if (filled[id]) {
      return "filled";
    }

    return gapIndex < index ? "skipped" : "waiting";
  }

  return (
    <>
      <p className="text-label leading-[20.8px] text-accent-strong">2 / 3 · 빈 곳 채우기</p>
      <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-5 pt-3">
        <Card as="section" size="xl" aria-label="빈 곳 채우기">
          {gap.kind === "artifacts" ? (
            <PortfolioArtifactRequest
              key={gap.id}
              category={<GapCategory gap={gap} />}
              progress={progress}
              question={gap.question}
              initialAttachments={filled[gap.id]}
              {...backProps}
              onSubmit={(attachments) => goNext({ ...filled, [gap.id]: attachments })}
              onSkip={() => goNext({ ...filled, [gap.id]: undefined })}
            />
          ) : (
            <AiQuestionForm
              key={gap.id}
              category={<GapCategory gap={gap} />}
              progress={progress}
              source={gap.gap}
              question={gap.question}
              placeholder="확인할 수 있는 것만 적어 주세요"
              initialAnswer={filled[gap.id]}
              {...backProps}
              onAnswer={(answer) => goNext({ ...filled, [gap.id]: answer })}
              onSkip={() => goNext({ ...filled, [gap.id]: undefined })}
            />
          )}
        </Card>
        <GapList gaps={gaps} getStatus={getStatus} />
      </div>
    </>
  );
}
