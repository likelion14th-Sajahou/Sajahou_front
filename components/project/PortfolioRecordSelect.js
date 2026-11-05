"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TextLink from "@/components/ui/TextLink";
import RecordFormFooter from "./RecordFormFooter";

function RecordOption({ record, isSelected, onToggle }) {
  const { date, weekday, did, problem, attachments } = record;
  const title = [`${date}(${weekday})`, did].filter(Boolean).join(" · ");
  const summary = [problem, attachments.length > 0 && `첨부 ${attachments.length}개`]
    .filter(Boolean)
    .join(" · ");

  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border bg-white px-4 py-3.5 ${isSelected ? "border-ink" : "border-line"}`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        className="mt-[3px] mr-[3px] ml-1 size-[18px] shrink-0 cursor-pointer accent-ink"
      />
      <span className="flex min-w-0 flex-col">
        <span className="text-body leading-6 text-ink">{title}</span>
        {summary && <span className="text-label leading-[19.5px] text-ink-subtle">{summary}</span>}
      </span>
    </label>
  );
}

export default function PortfolioRecordSelect({ records, onCancel, onNext }) {
  // 처음 마칠 때는 모든 기록을 고른 채로 시작한다(H-16).
  const [selectedIds, setSelectedIds] = useState(() => records.map(({ id }) => id));

  function toggleRecord(recordId) {
    setSelectedIds((current) =>
      current.includes(recordId)
        ? current.filter((id) => id !== recordId)
        : [...current, recordId],
    );
  }

  return (
    <Card as="section" size="md" aria-labelledby="portfolio-select-title" className="flex flex-col gap-4">
      <div>
        <p className="text-label leading-[20.8px] text-accent-strong">1 / 3 · 기록 고르기</p>
        <h2 id="portfolio-select-title" className="text-title leading-8 tracking-[-0.4px] text-ink">
          포트폴리오에 넣을 기록 고르기
        </h2>
        <p className="text-label leading-[19.5px] text-ink-subtle">
          고른 기록만 근거로 써요. 기록에 없는 성과는 넣지 않아요.
        </p>
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
      <RecordFormFooter>
        <TextLink onClick={onCancel}>취소</TextLink>
        <Button variant="accent" className="ml-auto" disabled={selectedIds.length === 0} onClick={onNext}>
          AI가 빈 곳 찾기 →
        </Button>
      </RecordFormFooter>
    </Card>
  );
}
