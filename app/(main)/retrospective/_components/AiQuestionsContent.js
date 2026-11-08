"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import Toast, { useToast } from "@/components/ui/Toast";
import { MOCK_AI_QUESTIONS } from "@/lib/mock/retrospective";
import RetrospectiveSteps from "./RetrospectiveSteps";
import AiQuestionsComplete from "./AiQuestionsComplete";
import { useRetrospectivePreview } from "./RetrospectivePreview";
import CardTitle from "@/components/ui/CardTitle";
import ActionFooter from "@/components/ui/ActionFooter";

export default function AiQuestionsContent({ initialComplete = false }) {
  const { getStepHref } = useRetrospectivePreview();
  const [currentIndex, setCurrentIndex] = useState(initialComplete ? MOCK_AI_QUESTIONS.length - 1 : 0);
  const [isComplete, setIsComplete] = useState(initialComplete);
  // AI는 질문만 하고 답은 사용자가 직접 쓴다(C-07). 질문 끝 미리보기(initialComplete)만 시안의 답을 채워 보여 준다.
  const [responses, setResponses] = useState(() => Object.fromEntries(MOCK_AI_QUESTIONS.map((item) => [item.id, {
    answer: initialComplete ? item.exampleAnswer : "",
    status: initialComplete ? "answered" : "pending",
  }])));
  const [notice, setNotice] = useState("");
  const { toast, showToast, hideToast } = useToast();
  const question = MOCK_AI_QUESTIONS[currentIndex];
  const answer = responses[question.id].answer;

  function updateAnswer(value) {
    setResponses((previous) => ({ ...previous, [question.id]: { ...previous[question.id], answer: value } }));
    setNotice("");
  }

  function advance(skipped = false) {
    if (!skipped && !answer.trim()) {
      showToast("답을 적거나, 모르겠으면 건너뛰어도 돼요");
      return;
    }
    setResponses((previous) => ({ ...previous, [question.id]: { ...previous[question.id], status: skipped ? "skipped" : "answered" } }));
    setNotice("");
    if (currentIndex === MOCK_AI_QUESTIONS.length - 1) setIsComplete(true);
    else setCurrentIndex(currentIndex + 1);
  }

  return (
    <>
      <RetrospectiveSteps currentStep={2} />
      <div className="mt-7 grid grid-cols-[minmax(0,1fr)_320px] items-start gap-5">
        <div className="flex min-w-0 flex-col gap-4">
          {isComplete ? (
            <AiQuestionsComplete
              questions={MOCK_AI_QUESTIONS}
              responses={responses}
              reviewHref={getStepHref("review")}
              onEdit={(index) => { setCurrentIndex(index); setIsComplete(false); setNotice(""); }}
            />
          ) : (
            <Card as="section" size="md" className="min-w-0 rounded-[28px]" aria-labelledby="ai-question-title">
              <div className="flex flex-col gap-4 p-1">
                <div className="flex items-center gap-2">
                  <Badge tone="dark">AI 질문</Badge>
                  <Badge tone={question.tone} size="sm">{question.category}</Badge>
                  <p className="ml-auto text-label text-ink-subtle" aria-label={`총 ${MOCK_AI_QUESTIONS.length}개 중 ${currentIndex + 1}번째 질문`}>
                    {currentIndex + 1} / {MOCK_AI_QUESTIONS.length}
                  </p>
                </div>
                <p className="rounded-xl bg-canvas px-3.5 py-2.5 text-body-sm text-ink-muted">
                  내 자료의 <mark className="rounded bg-shape-yellow/60 px-[3px] text-ink">“{question.source}”</mark> 에서 더 물어볼게요
                </p>
                <h2 id="ai-question-title" className="text-[24px] leading-[1.45] tracking-[-0.01em]">
                  {question.question}
                </h2>
                <TextField
                  label="내 답변"
                  multiline
                  name="answer"
                  value={answer}
                  onChange={(event) => updateAnswer(event.target.value)}
                  className="h-[98px]"
                />
                <div className="flex items-center gap-3">
                  {/* 첫 질문은 자료 단계로, 두 번째부터는 앞 질문으로 돌아간다(R-16). */}
                  {currentIndex === 0 ? (
                    <TextLink href={getStepHref("materials")}>← 자료로</TextLink>
                  ) : (
                    <TextLink onClick={() => { setCurrentIndex(currentIndex - 1); setNotice(""); }}>← 이전 질문</TextLink>
                  )}
                  <span aria-hidden="true" className="h-4 w-px bg-line" />
                  <TextLink onClick={() => advance(true)}>건너뛰기</TextLink>
                  <Button className="ml-auto" onClick={() => advance()}>답하고 다음 →</Button>
                </div>
              </div>
            </Card>
          )}
          <p role="status" className={notice ? "text-body-sm text-ink-muted" : "sr-only"}>{notice}</p>
        </div>

        <Card as="aside" size="md" aria-labelledby="ai-question-guide-title">
          <CardTitle id="ai-question-guide-title" action={<ShapeCharacter shape="triangle" color="coral" size={16} face="none" cropped />}>
            AI가 찾은 더 물어볼 곳
          </CardTitle>
          <ol className="mt-4 flex flex-col gap-2">
            {MOCK_AI_QUESTIONS.map((item, index) => (
              <li key={item.id} aria-current={!isComplete && index === currentIndex ? "step" : undefined} className={`flex flex-col items-start gap-1 rounded-xl px-3 py-2.5 ${!isComplete && index === currentIndex ? "bg-tint-orange" : `bg-canvas ${responses[item.id].status !== "pending" ? "opacity-70" : ""}`}`}>
                <Badge tone={item.tone} size="sm">{item.category}</Badge>
                <p className="text-[13.5px] leading-[1.6]">“{item.source}”</p>
                <p className="text-label leading-[1.5] text-ink-subtle">{!isComplete && index === currentIndex ? "지금 질문 중" : responses[item.id].status === "answered" ? "답함 ✓" : responses[item.id].status === "skipped" ? "건너뜀" : "대기"}</p>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-label leading-[1.5] text-ink-subtle">자소서에 쓸 가치가 큰 곳부터 최대 5개만 물어요. 마지막은 느낀 점이에요.</p>
          <ActionFooter>
            <TextLink href={getStepHref("materials")}>← 자료 고치기</TextLink>
            <TextLink onClick={() => setNotice("임시 저장은 준비 중이에요. 화면을 벗어나면 입력한 내용이 사라져요.")}>나중에 이어쓰기</TextLink>
          </ActionFooter>
        </Card>
      </div>
      <Toast toast={toast} onDismiss={hideToast} />
    </>
  );
}
