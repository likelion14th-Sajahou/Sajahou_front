"use client";

import { useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import PortfolioGapFill from "./PortfolioGapFill";
import PortfolioRecordSelect from "./PortfolioRecordSelect";
import PortfolioReview from "./PortfolioReview";
import useProjectAction from "./useProjectAction";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getFinishQuestions, getPortfolioDraft } from "@/lib/projectApi";
import { restoreFinishQuestions } from "@/lib/portfolioViewModel";

export default function ProjectPortfolio({ project, records, onCancel, onSave }) {
  const [step, setStep] = useState("records");
  const [selectedIds, setSelectedIds] = useState();
  const [questions, setQuestions] = useState({ questions: [], inputs: {}, attachments: {}, index: 0 });
  const [draft, setDraft] = useState(null);
  const { run, busy, error, clearError } = useProjectAction();
  const { authenticatedRequest } = useAuth();
  async function requestDraft(ids, signal) {
    const result = await getPortfolioDraft(project.id, ids.map(Number), { signal, request: authenticatedRequest });
    signal.throwIfAborted();
    setDraft(result); setStep("review");
  }
  function backToRecords() { clearError(); setStep("records"); }
  function startQuestions(ids) {
    run(async (signal) => {
      const result = await getFinishQuestions(project.id, ids.map(Number), { signal, request: authenticatedRequest });
      signal.throwIfAborted();
      setSelectedIds(ids);
      setQuestions((current) => restoreFinishQuestions(result.questions, current));
      if (result.questions.length === 0) {
        // 같은 요청 안에서 이어서 생성한다. state 갱신 전의 selectedIds를 읽지 않는다.
        setStep("draft");
        await requestDraft(ids, signal);
      } else setStep("gaps");
    });
  }
  function makeDraft() {
    run((signal) => requestDraft(selectedIds, signal));
  }
  return <fieldset disabled={busy} className="min-w-0" aria-busy={busy}>
    {step === "records" && <PortfolioRecordSelect records={records} initialSelectedIds={selectedIds} onCancel={onCancel} onNext={startQuestions} />}
    {step === "gaps" && <PortfolioGapFill state={questions} onChange={setQuestions} onBackToRecords={backToRecords} onComplete={makeDraft} />}
    {step === "draft" && <Card as="section" size="md" className="flex flex-col gap-3">
      <p>추가 질문이 없어 바로 포트폴리오 초안을 만들어요.</p>
      <Button variant="secondary" onClick={backToRecords}>← 기록 고르기</Button>
    </Card>}
    {step === "review" && <PortfolioReview project={project} initialMarkdown={draft.markdown} blanks={draft.blanks} onSave={onSave}
      backLabel={questions.questions.length ? "← 이전 질문으로" : "← 기록 고르기"} onBack={() => {
      clearError();
      if (!questions.questions.length) { setStep("records"); return; }
      setQuestions((current) => ({ ...current, index: Math.max(0, current.questions.length - 1) })); setStep("gaps");
    }} />}
    {busy && <p role="status">AI 응답을 기다리고 있어요. 최대 50초 걸릴 수 있어요…</p>}
    {error && <div role="alert" className="flex flex-wrap items-center gap-2 text-label text-tint-red-ink">{error}{["gaps", "draft"].includes(step) && <Button variant="secondary" size="sm" onClick={makeDraft}>초안 다시 만들기</Button>}</div>}
  </fieldset>;
}
