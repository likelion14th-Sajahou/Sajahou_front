"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import AiQuestionForm from "@/components/ui/AiQuestionForm";
import Badge from "@/components/ui/Badge";
import { saveQuestionAnswer } from "@/lib/projectApi";

// 질문 ID별 입력은 상위 폼에 둔다. 자료·검토 화면으로 이동해도 미전송 답이 유지된다.
// 11/13 디자인: 회고 AI 질문과 같은 진한 톤이다. 마지막 질문의 버튼은 '정리 보기 →'다.
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
    <AiQuestionForm tone="dark" category={<Badge tone="tag" size="sm">{question.tag}</Badge>} progress={`${index + 1} / ${questions.length}`} source={sourceLabel ? <>
      첨부한 <mark className="rounded bg-yellow-400 px-[3px] break-all text-ink-950">{sourceLabel}</mark>을(를) 바탕으로 물어볼게요
    </> : question.sourceAttachmentId == null ? "적어 준 오늘 한 일을 바탕으로 물어볼게요" : "질문에 연결된 자료를 바탕으로 물어볼게요"}
      question={question.content} answer={inputs[question.questionId] ?? question.answer ?? ""}
      onAnswerChange={(answer) => onChange({ ...state, inputs: { ...inputs, [question.questionId]: answer } })}
      backLabel={index === 0 ? "← 자료로" : "← 이전 질문"} onBack={index === 0 ? onBackToMaterials : () => onChange({ ...state, index: index - 1 })}
      onAnswer={(answer) => submit("ANSWERED", answer)} onSkip={() => submit("SKIPPED")}
      submitLabel={index === questions.length - 1 ? "정리 보기 →" : "답하고 다음 →"} />
    {busy && <p role="status" className="pt-2 text-label text-locked">답변을 저장하고 있어요…</p>}
    {error && <p role="alert" className="pt-2 text-label text-tint-red">{error}</p>}
  </fieldset>;
}
