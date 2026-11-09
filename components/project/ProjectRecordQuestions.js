"use client";

import { useState, useRef, useEffect } from "react";
import AiQuestionForm from "@/components/ui/AiQuestionForm";
import Button from "@/components/ui/Button";
import { saveQuestionAnswer } from "@/lib/projectApi";

// 질문 ID별 입력은 상위 폼에 둔다. 자료·검토 화면으로 이동해도 미전송 답이 유지된다.
export default function ProjectRecordQuestions({ state, onChange, onBackToMaterials, onComplete }) {
  const { questions, index, inputs } = state;
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const active = useRef(null);
  useEffect(() => () => active.current?.abort(), []);
  const question = questions[index];

  async function submit(status, answer) {
    if (active.current) return;
    const controller = new AbortController(); active.current = controller; setBusy(true); setError("");
    try {
      const saved = await saveQuestionAnswer(question.questionId, { status, ...(status === "ANSWERED" ? { answer } : {}) }, { signal: controller.signal });
      controller.signal.throwIfAborted();
      const next = { ...state, questions: questions.map((q) => q.questionId === saved.questionId ? { ...q, ...saved } : q),
        inputs: { ...inputs, [question.questionId]: saved.answer ?? "" }, index: Math.min(index + 1, questions.length - 1) };
      onChange(next);
      if (index === questions.length - 1) onComplete();
    } catch (error) { if (!controller.signal.aborted) setError(error.message); }
    finally { active.current = null; if (!controller.signal.aborted) setBusy(false); }
  }

  if (!question) return <div><p>질문이 없어요. 자료를 보완하거나 이대로 정리할 수 있어요.</p><Button onClick={onBackToMaterials}>← 자료로</Button><Button onClick={onComplete}>정리 결과 확인</Button></div>;
  return <fieldset disabled={busy} className="min-w-0">
    <AiQuestionForm category={question.tag} progress={`${index + 1} / ${questions.length}`} source={question.quote || "첨부 자료와 메모를 바탕으로 물어볼게요"}
      question={question.content} placeholder="한두 문장이면 충분해요" answer={inputs[question.questionId] ?? question.answer ?? ""}
      onAnswerChange={(answer) => onChange({ ...state, inputs: { ...inputs, [question.questionId]: answer } })}
      backLabel={index === 0 ? "← 자료로" : "← 이전 질문"} onBack={index === 0 ? onBackToMaterials : () => onChange({ ...state, index: index - 1 })}
      onAnswer={(answer) => submit("ANSWERED", answer)} onSkip={() => submit("SKIPPED")} />
    {busy && <p role="status">답변을 저장하고 있어요…</p>}
    {error && <p role="alert" className="text-tint-red-ink">{error}</p>}
  </fieldset>;
}
