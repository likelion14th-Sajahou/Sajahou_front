"use client";

import { useState } from "react";
import PortfolioGapFill from "./PortfolioGapFill";
import PortfolioRecordSelect from "./PortfolioRecordSelect";
import PortfolioReview from "./PortfolioReview";

export default function ProjectPortfolio({
  project,
  cardNumber,
  records,
  competencies,
  onCancel,
  onSaveCard,
}) {
  const [step, setStep] = useState("records");
  const [selectedIds, setSelectedIds] = useState([]);
  const [filled, setFilled] = useState({});
  // 고를 때와 같이 진행 순서(오래된 기록부터)로 글을 쓴다.
  const selectedRecords = records.toReversed().filter(({ id }) => selectedIds.includes(id));

  if (step === "records") {
    return (
      <PortfolioRecordSelect
        isFirstCard={project.status === "active"}
        cardNumber={cardNumber}
        records={records}
        onCancel={onCancel}
        onNext={(nextSelectedIds) => {
          setSelectedIds(nextSelectedIds);
          setStep("gaps");
        }}
      />
    );
  }

  if (step === "gaps") {
    return (
      <PortfolioGapFill
        projectId={project.id}
        initialFilled={filled}
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
      competencies={competencies}
      onBack={() => setStep("gaps")}
      onSave={onSaveCard}
    />
  );
}
