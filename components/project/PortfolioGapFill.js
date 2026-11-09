"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";
import AiQuestionForm from "@/components/ui/AiQuestionForm";
import RecordAttachmentsField from "./RecordAttachmentsField";
import useProjectAction from "./useProjectAction";
import { saveQuestionAnswer } from "@/lib/projectApi";

export default function PortfolioGapFill({ state, onChange, onBackToRecords, onComplete }) {
  const { questions, inputs, index } = state;
  const question = questions[index];
  const { run, busy, error } = useProjectAction();
  const [attachmentBusy, setAttachmentBusy] = useState(false);
  if (!question) return <div><p>추가 질문이 없어요.</p><Button onClick={onBackToRecords}>← 기록 고르기</Button><Button onClick={onComplete}>포트폴리오 초안 만들기</Button></div>;
  const attachments = state.attachments[question.questionId] ?? [];
  const isArtifact = question.tag === "산출물 요청";
  const back = () => index === 0 ? onBackToRecords() : onChange({ ...state, index: index - 1 });
  function submit(status, answer) {
    run(async (signal) => {
      const result = await saveQuestionAnswer(question.questionId, { status,
        ...(status === "ANSWERED" ? isArtifact ? { attachmentIds: attachments.map((a) => a.attachmentId) } : { answer } : {}) }, { signal });
      signal.throwIfAborted();
      onChange({ ...state, questions: questions.map((q) => q.questionId === result.questionId ? { ...q, ...result } : q),
        inputs: { ...inputs, [question.questionId]: result.answer ?? "" }, index: Math.min(index + 1, questions.length - 1) });
      if (index === questions.length - 1) onComplete();
    });
  }
  return <>
    <p className="text-label text-accent-strong">2 / 3 · 빈 곳 채우기</p>
    <div className="grid grid-cols-1 items-start gap-5 pt-3 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card as="section" size="md" aria-label="빈 곳 채우기">
        <fieldset disabled={busy} className="min-w-0">
          {isArtifact ? <div className="flex flex-col gap-3">
            <Badge>{question.tag}</Badge><p>{index + 1} / {questions.length}</p><h2>{question.content}</h2>
            <RecordAttachmentsField category="OUTPUT" attachments={attachments} onBusyChange={setAttachmentBusy} onChange={(items) => onChange({ ...state, attachments: { ...state.attachments, [question.questionId]: items } })} />
            <div className="flex flex-wrap gap-3"><TextLink onClick={back}>← 이전 질문</TextLink><TextLink disabled={attachmentBusy} onClick={() => submit("SKIPPED")}>아직 없어요</TextLink>
              <Button disabled={attachmentBusy || !attachments.length || attachments.some((a) => a.extractStatus === "PENDING")} onClick={() => submit("ANSWERED")}>첨부하고 다음 →</Button></div>
          </div> : <AiQuestionForm category={question.tag} source={question.quote || "고른 기록에서 빈 곳을 보완해 주세요"} question={question.content}
            progress={`${index + 1} / ${questions.length}`} placeholder="확인할 수 있는 것만 적어 주세요"
            answer={inputs[question.questionId] ?? question.answer ?? ""} onAnswerChange={(answer) => onChange({ ...state, inputs: { ...inputs, [question.questionId]: answer } })}
            backLabel={index === 0 ? "← 기록 고르기" : "← 이전 질문"} onBack={back} onAnswer={(answer) => submit("ANSWERED", answer)} onSkip={() => submit("SKIPPED")} />}
          {error && <p role="alert">{error}</p>}
        </fieldset>
      </Card>
      <Card as="aside" size="md" aria-label="AI가 찾은 빈 곳"><h2>AI가 찾은 빈 곳</h2><ol className="flex flex-col gap-3 pt-3">
        {questions.map((q, i) => <li key={q.questionId} className="rounded-xl bg-canvas p-3"><p>{q.tag}</p><p className="text-label text-ink-subtle">{i === index ? "지금" : q.status === "ANSWERED" ? "채움 ✓" : q.status === "SKIPPED" ? "건너뜀" : "대기"}</p></li>)}
      </ol></Card>
    </div>
  </>;
}
