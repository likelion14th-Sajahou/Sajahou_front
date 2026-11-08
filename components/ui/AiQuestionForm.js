"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import Toast, { useToast } from "@/components/ui/Toast";
import AiPromptHeader from "./AiPromptHeader";

// 회고(R-16), 기록 추가(H-13), 포트폴리오 빈 곳(H-17)이 함께 쓰는 AI 질문 카드다.
// 버튼: [← 이전] | 건너뛰기 … 답하고 다음 →. AI는 질문만 하고 답은 사용자가 직접 쓴다(C-07).
// - 답 보관: answer·onAnswerChange를 넘기면 쓰는 화면이 답을 들고 있고, 없으면 폼 안에서 들고 있다.
//   폼 안에서 들 때는 질문이 바뀌면 입력을 비우도록 쓰는 곳에서 질문별 key를 준다.
// - size: "md"는 카드 안의 h3(20px), "lg"는 화면의 주 제목인 h2(24px, 회고 04 시안)다.
const QUESTION_SIZES = {
  md: { as: "h3", className: "text-title leading-[29px] tracking-[-0.2px] text-ink" },
  lg: { as: "h2", className: "text-[24px] leading-[1.45] tracking-[-0.24px] text-ink" },
};

export default function AiQuestionForm({
  category,
  progress,
  progressLabel,
  source,
  question,
  questionId,
  size = "md",
  placeholder,
  initialAnswer = "",
  answer: controlledAnswer,
  onAnswerChange,
  backLabel,
  backHref,
  onBack,
  onAnswer,
  onSkip,
}) {
  const [ownAnswer, setOwnAnswer] = useState(initialAnswer);
  const isControlled = controlledAnswer !== undefined;
  const answer = isControlled ? controlledAnswer : ownAnswer;
  const { toast, showToast, hideToast } = useToast();
  const { as: QuestionHeading, className: questionClassName } = QUESTION_SIZES[size];

  function changeAnswer(value) {
    if (isControlled) {
      onAnswerChange(value);
    } else {
      setOwnAnswer(value);
    }
  }

  function submitAnswer() {
    if (!answer.trim()) {
      showToast("답을 적거나, 모르겠으면 건너뛰어도 돼요");
      return;
    }

    onAnswer(answer.trim());
  }

  return (
    <div className="flex flex-col gap-4">
      <AiPromptHeader category={category} progress={progress} progressLabel={progressLabel} />
      <p className="rounded-xl bg-canvas px-3.5 py-2.5 text-body-sm text-ink-muted">{source}</p>
      <QuestionHeading id={questionId} className={questionClassName}>{question}</QuestionHeading>
      <TextField
        label="내 답변"
        multiline
        name="answer"
        placeholder={placeholder}
        value={answer}
        onChange={(event) => changeAnswer(event.target.value)}
        className="h-[98px]"
      />
      <div className="flex items-center gap-3">
        {backLabel && (
          <>
            {/* 다른 단계로 가는 뒤로 가기는 링크(backHref), 같은 화면 안의 이동은 버튼(onBack)이다. */}
            <TextLink href={backHref} onClick={onBack}>{backLabel}</TextLink>
            <span aria-hidden="true" className="h-4 w-px bg-line" />
          </>
        )}
        <TextLink onClick={onSkip}>건너뛰기</TextLink>
        <Button className="ml-auto" onClick={submitAnswer}>답하고 다음 →</Button>
      </div>
      <Toast toast={toast} onDismiss={hideToast} />
    </div>
  );
}
