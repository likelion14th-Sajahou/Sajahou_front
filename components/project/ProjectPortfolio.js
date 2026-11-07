"use client";

import { useState } from "react";
import PortfolioGapFill from "./PortfolioGapFill";
import PortfolioRecordSelect from "./PortfolioRecordSelect";
import PortfolioReview from "./PortfolioReview";

export default function ProjectPortfolio({
  project,
  records,
  onCancel,
  onSave,
}) {
  const [step, setStep] = useState("records");
  const [selectedIds, setSelectedIds] = useState();
  const [filled, setFilled] = useState({});
  const [gapsStartAtLast, setGapsStartAtLast] = useState(false);
  // 고를 때와 같이 진행 순서(오래된 기록부터)로 글을 쓴다.
  const selectedRecords = records.toReversed().filter(({ id }) => selectedIds?.includes(id));

  if (step === "records") {
    return (
      <PortfolioRecordSelect
        records={records}
        initialSelectedIds={selectedIds}
        onCancel={onCancel}
        onNext={(nextSelectedIds) => {
          setSelectedIds(nextSelectedIds);
          setGapsStartAtLast(false);
          setStep("gaps");
        }}
      />
    );
  }

  if (step === "gaps") {
    return (
      <PortfolioGapFill
        initialFilled={filled}
        startAtLast={gapsStartAtLast}
        onBackToRecords={() => setStep("records")}
        onComplete={(nextFilled) => {
          setFilled(nextFilled);
          setStep("review");
        }}
      />
    );
  }

  return (
    <PortfolioReview
      project={project}
      records={selectedRecords}
      filled={filled}
      onBack={() => {
        setGapsStartAtLast(true);
        setStep("gaps");
      }}
      onSave={onSave}
    />
  );
}
