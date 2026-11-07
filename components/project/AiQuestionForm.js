"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import Toast, { useToast } from "@/components/ui/Toast";
import AiPromptHeader from "./AiPromptHeader";

// 질문이 바뀌면 입력을 비우도록, 쓰는 곳에서 질문별 key를 준다.
export default function AiQuestionForm({
  category,
  progress,
  source,
  question,
  placeholder,
  exampleAnswer,
  initialAnswer = "",
  onAnswer,
  onSkip,
}) {
  const [answer, setAnswer] = useState(initialAnswer);
  const { toast, showToast, hideToast } = useToast();

  function submitAnswer() {
    if (!answer.trim()) {
      showToast("답을 적거나, 모르겠으면 건너뛰어도 돼요");
      return;
    }

    onAnswer(answer.trim());
  }

  return (
    <div className="flex flex-col gap-4">
      <AiPromptHeader category={category} progress={progress} />
      <p className="rounded-xl bg-canvas px-3.5 py-2.5 text-body-sm text-ink-muted">{source}</p>
      <h3 className="text-title leading-[29px] tracking-[-0.2px] text-ink">{question}</h3>
      <TextField
        label="내 답변"
        multiline
        placeholder={placeholder}
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        className="h-[98px]"
      />
      <div className="flex items-center gap-3">
        <TextLink onClick={() => setAnswer(exampleAnswer)}>예시 답변 넣기</TextLink>
        <TextLink onClick={onSkip}>건너뛰기</TextLink>
        <Button className="ml-auto" onClick={submitAnswer}>답하고 다음 →</Button>
      </div>
      <Toast toast={toast} onDismiss={hideToast} />
    </div>
  );
}
