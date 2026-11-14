"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Checkbox from "@/components/ui/Checkbox";
import TextLink from "@/components/ui/TextLink";
import ActionFooter from "@/components/ui/ActionFooter";
import DrawnBorder from "@/components/ui/DrawnBorder";
import { formatMonthDay } from "@/lib/formatDate";

function RecordOption({ record, isSelected, onToggle }) {
  const { date, weekday, did, problem, attachments } = record;
  const summary = [problem, attachments.length > 0 && `첨부 ${attachments.length}개`]
    .filter(Boolean)
    .join(" · ");

  return (
    <label
      className={`relative flex cursor-pointer items-start gap-3 rounded-[18px] px-4 py-3.5 ${isSelected ? "bg-[#fffbea]" : "bg-white"}`}
    >
      <DrawnBorder variant="thin-outline" color={isSelected ? "var(--color-ink-900)" : "var(--color-ink-300)"} />
      <Checkbox checked={isSelected} onChange={onToggle} className="mt-0.5 mr-0.5 ml-1" />
      <span className="flex min-w-0 flex-col">
        <span className="flex flex-wrap items-center gap-1 text-body text-ink">
          <span className="leading-6"><strong>{formatMonthDay(date)}({weekday})</strong>{did && ` · ${did}`}</span>
        </span>
        {summary && <span className="text-label leading-[19.5px] text-ink-subtle">{summary}</span>}
      </span>
    </label>
  );
}

export default function PortfolioRecordSelect({ records, initialSelectedIds, onCancel, onNext, waitingNotice }) {
  // 처음 마칠 때도 다시 만들 때도 모든 기록을 고른 채로 시작한다(H-16). 빈 곳 질문에서 돌아오면 고른 기록을 그대로 둔다.
  const [selectedIds, setSelectedIds] = useState(() => initialSelectedIds ?? records.map(({ id }) => id));

  function toggleRecord(recordId) {
    setSelectedIds((current) =>
      current.includes(recordId)
        ? current.filter((id) => id !== recordId)
        : [...current, recordId],
    );
  }

  return (
    <Card as="section" size="md" aria-labelledby="portfolio-select-title" className="relative flex flex-col gap-5 font-display text-ink-strong">
      <DrawnBorder variant="section-card" color="var(--color-ink-300)" />
      <div>
        <p className="text-label leading-[20.8px] text-accent-strong">
          1 / 3 · 기록 고르기
        </p>
        <h2 id="portfolio-select-title" className="text-title leading-8 tracking-[-0.4px] text-ink">
          포트폴리오에 넣을 기록 고르기
        </h2>
      </div>
      {/* 기록 목록은 최신순이지만, 고를 때는 시안대로 진행 순서(오래된 기록부터)로 보여 준다. */}
      {records.toReversed().map((record) => (
        <RecordOption
          key={record.id}
          record={record}
          isSelected={selectedIds.includes(record.id)}
          onToggle={() => toggleRecord(record.id)}
        />
      ))}
      <div className="flex flex-col gap-3">
        <ActionFooter>
          <TextLink onClick={onCancel}>취소</TextLink>
          <Button variant="cta-ink" className="ml-auto h-[46px]!" disabled={selectedIds.length === 0} onClick={() => onNext(selectedIds)}>
            AI가 빈 곳 찾기 →
          </Button>
        </ActionFooter>
        {waitingNotice}
      </div>
    </Card>
  );
}
