"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import AiQuestionForm from "@/components/ui/AiQuestionForm";
import { saveQuestionAnswer } from "@/lib/projectApi";

// 질문 ID별 입력은 상위 폼에 둔다. 자료·검토 화면으로 이동해도 미전송 답이 유지된다.
export default function ProjectRecordQuestions({ state, onChange, onBackToMaterials, onComplete }) {
  const { questions, index, inputs, sourceAttachments = [] } = state;
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const active = useRef(null);
  const { authenticatedRequest } = useAuth();
  useEffect(() => () => active.current?.abort(), []);
  const question = questions[index];
  const source = question?.sourceAttachmentId == null ? null
    : sourceAttachments.find((attachment) => String(attachment.attachmentId) === String(question.sourceAttachmentId));
  const sourceLabel = source?.name ?? source?.url;

  async function submit(status, answer) {
    if (active.current) return;
    const controller = new AbortController(); active.current = controller; setBusy(true); setError("");
    try {
      const saved = await saveQuestionAnswer(question.questionId, { status, ...(status === "ANSWERED" ? { answer } : {}) }, { signal: controller.signal, request: authenticatedRequest });
      controller.signal.throwIfAborted();
      const next = { ...state, questions: questions.map((q) => q.questionId === saved.questionId ? { ...q, ...saved } : q),
        inputs: { ...inputs, [question.questionId]: saved.answer ?? "" }, index: Math.min(index + 1, questions.length - 1) };
      onChange(next);
      if (index === questions.length - 1) onComplete();
    } catch (error) { if (!controller.signal.aborted) setError(error.message); }
    finally { active.current = null; if (!controller.signal.aborted) setBusy(false); }
  }

  if (!question) return null;
  return <fieldset disabled={busy} className="min-w-0">
    <AiQuestionForm category={question.tag} progress={`${index + 1} / ${questions.length}`} source={sourceLabel ? <>
      첨부한 <mark className="rounded bg-shape-yellow/60 px-[3px] break-all text-ink">{sourceLabel}</mark>을(를) 바탕으로 물어볼게요
    </> : question.sourceAttachmentId == null ? "적어 준 메모를 바탕으로 물어볼게요" : "질문에 연결된 자료를 바탕으로 물어볼게요"}
      question={question.content} placeholder="한두 문장이면 충분해요" answer={inputs[question.questionId] ?? question.answer ?? ""}
      onAnswerChange={(answer) => onChange({ ...state, inputs: { ...inputs, [question.questionId]: answer } })}
      backLabel={index === 0 ? "← 자료로" : "← 이전 질문"} onBack={index === 0 ? onBackToMaterials : () => onChange({ ...state, index: index - 1 })}
      onAnswer={(answer) => submit("ANSWERED", answer)} onSkip={() => submit("SKIPPED")} />
    {busy && <p role="status">답변을 저장하고 있어요…</p>}
    {error && <p role="alert" className="text-tint-red-ink">{error}</p>}
  </fieldset>;
}
