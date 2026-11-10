"use client";

import { useState } from "react";
import PortfolioGapFill from "./PortfolioGapFill";
import PortfolioRecordSelect from "./PortfolioRecordSelect";
import PortfolioReview from "./PortfolioReview";
import useProjectAction from "./useProjectAction";
import { getFinishQuestions, getPortfolioDraft } from "@/lib/projectApi";

export default function ProjectPortfolio({ project, records, onCancel, onSave }) {
  const [step, setStep] = useState("records");
  const [selectedIds, setSelectedIds] = useState();
  const [questions, setQuestions] = useState({ questions: [], inputs: {}, attachments: {}, index: 0 });
  const [draft, setDraft] = useState(null);
  const { run, busy, error } = useProjectAction();
  function startQuestions(ids) {
    run(async (signal) => {
      const result = await getFinishQuestions(project.id, ids.map(Number), { signal });
      signal.throwIfAborted();
      setSelectedIds(ids);
      setQuestions((current) => ({ ...current, questions: result.questions, index: Math.min(current.index, Math.max(0, result.questions.length - 1)) }));
      setStep("gaps");
    });
  }
  function makeDraft() {
    run(async (signal) => {
      const result = await getPortfolioDraft(project.id, selectedIds.map(Number), { signal });
      signal.throwIfAborted(); setDraft(result); setStep("review");
    });
  }
  return <fieldset disabled={busy} className="min-w-0" aria-busy={busy}>
    {step === "records" && <PortfolioRecordSelect records={records} initialSelectedIds={selectedIds} onCancel={onCancel} onNext={startQuestions} />}
    {step === "gaps" && <PortfolioGapFill state={questions} onChange={setQuestions} onBackToRecords={() => setStep("records")} onComplete={makeDraft} />}
    {step === "review" && <PortfolioReview project={project} initialMarkdown={draft.markdown} blanks={draft.blanks} onSave={onSave} onBack={() => {
      setQuestions((current) => ({ ...current, index: Math.max(0, current.questions.length - 1) })); setStep("gaps");
    }} />}
    {busy && <p role="status">AI 응답을 기다리고 있어요. 최대 50초 걸릴 수 있어요…</p>}
    {error && <div role="alert">{error}{step === "gaps" && <button onClick={makeDraft}>초안 다시 만들기</button>}</div>}
  </fieldset>;
}
