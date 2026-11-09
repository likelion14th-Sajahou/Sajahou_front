"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import TextLink from "@/components/ui/TextLink";
import AiQuestionForm from "@/components/ui/AiQuestionForm";
import { MOCK_AI_QUESTIONS } from "@/lib/mock/retrospective";
import RetrospectiveSteps from "./RetrospectiveSteps";
import AiQuestionsComplete from "./AiQuestionsComplete";
import { useRetrospectivePreview } from "./RetrospectivePreview";
import { SavedTime, useSaveLater } from "./useSaveLater";
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
  const { save, isSaving, savedLabel } = useSaveLater();

  // 질문의 답은 답하기 API(18번)로 따로 저장한다. 여기서는 지금 단계만 저장한다.
  async function saveLater() {
    const message = await save({ currentStep: 3 });
    if (message !== null) setNotice(message);
  }
  const question = MOCK_AI_QUESTIONS[currentIndex];
  const answer = responses[question.id].answer;

  function updateAnswer(value) {
    setResponses((previous) => ({ ...previous, [question.id]: { ...previous[question.id], answer: value } }));
    setNotice("");
  }

  // 빈 답 검사는 AiQuestionForm이 한다. 여기서는 답함·건너뜀을 기록하고 다음 질문으로 넘어간다.
  function advance(skipped = false) {
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
              <div className="p-1">
                <AiQuestionForm
                  size="lg"
                  questionId="ai-question-title"
                  category={<Badge tone={question.tone} size="sm">{question.category}</Badge>}
                  progress={`${currentIndex + 1} / ${MOCK_AI_QUESTIONS.length}`}
                  progressLabel={`총 ${MOCK_AI_QUESTIONS.length}개 중 ${currentIndex + 1}번째 질문`}
                  source={
                    <>
                      내 자료의 <mark className="rounded bg-shape-yellow/60 px-[3px] text-ink">“{question.source}”</mark> 에서 더 물어볼게요
                    </>
                  }
                  question={question.question}
                  // 쓰던 답은 이 화면이 들고 있어서 앞뒤 질문을 오가도 남는다.
                  answer={answer}
                  onAnswerChange={updateAnswer}
                  // 첫 질문은 자료 단계로, 두 번째부터는 앞 질문으로 돌아간다(R-16).
                  backLabel={currentIndex === 0 ? "← 자료로" : "← 이전 질문"}
                  backHref={currentIndex === 0 ? getStepHref("materials") : undefined}
                  onBack={currentIndex === 0 ? undefined : () => { setCurrentIndex(currentIndex - 1); setNotice(""); }}
                  onAnswer={(trimmedAnswer) => {
                    updateAnswer(trimmedAnswer);
                    advance();
                  }}
                  onSkip={() => advance(true)}
                />
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
          <ActionFooter className="flex-wrap gap-x-3.5 gap-y-1">
            <TextLink href={getStepHref("materials")}>← 자료 고치기</TextLink>
            <TextLink onClick={saveLater} disabled={isSaving} aria-busy={isSaving}>{isSaving ? "저장하는 중…" : "나중에 이어쓰기"}</TextLink>
            <SavedTime label={savedLabel} />
          </ActionFooter>
        </Card>
      </div>
    </>
  );
}
