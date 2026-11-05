"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import PortfolioGapFill from "./PortfolioGapFill";
import PortfolioRecordSelect from "./PortfolioRecordSelect";

export default function ProjectPortfolio({ records, onCancel }) {
  const [step, setStep] = useState("records");

  if (step === "records") {
    return (
      <PortfolioRecordSelect
        records={records}
        onCancel={onCancel}
        onNext={() => setStep("gaps")}
      />
    );
  }

  if (step === "gaps") {
    return <PortfolioGapFill onComplete={() => setStep("review")} />;
  }

  // 포트폴리오 검토는 다음 작업에서 이어진다.
  return (
    <Card as="section" size="md">
      <p role="status" className="text-body-sm text-ink-subtle">포트폴리오를 준비하고 있어요.</p>
    </Card>
  );
}
