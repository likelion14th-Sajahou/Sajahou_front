"use client";

import { useRef, useState } from "react";
import Badge from "@/components/ui/Badge";
import TextLink from "@/components/ui/TextLink";
import AiQuestionForm from "@/components/ui/AiQuestionForm";
import AiQuestionsComplete from "./AiQuestionsComplete";
import AnsweredQuestionList from "./AnsweredQuestionList";
import QuestionProgressList from "./QuestionProgressList";
import RetroDarkCard from "./RetroDarkCard";
import RetroSideCard from "./RetroSideCard";
import { useRetrospectivePreview } from "./RetrospectivePreview";
import { SavedTime, useSaveLater } from "./useSaveLater";
import { getRequestErrorMessage } from "@/lib/requestErrorMessage";

const firstPendingIndex = (questions) => Math.max(0, questions.findIndex(({ status }) => status === "PENDING"));
const isAllDone = (questions) => questions.length > 0 && questions.every(({ status }) => status !== "PENDING");

// 3단계 AI 질문(R-16~18). 한 번에 한 질문씩 답하거나 건너뛴다.
// saveAnswer(question, { status, answer })는 저장된 { status, answer }를 돌려준다. 실패하면 넘어가지 않는다.
// 다시 들어오면 처음으로 안 푼 질문부터 열고, 모두 풀었으면 질문 끝 화면을 보여 준다.
export default function AiQuestionsSession({ initialQuestions, saveAnswer }) {
  const { getStepHref } = useRetrospectivePreview();
  const [questions, setQuestions] = useState(initialQuestions);
  const [index, setIndex] = useState(() => firstPendingIndex(initialQuestions));
  const [isComplete, setIsComplete] = useState(() => isAllDone(initialQuestions));
  // 저장하지 않고 쓰던 답. 다른 질문으로 갔다가 돌아와도 남는다(R-16).
  const [drafts, setDrafts] = useState({});
  const [isAnswering, setIsAnswering] = useState(false);
  const [notice, setNotice] = useState("");
  const inFlight = useRef(false);
  const { save, isSaving, savedLabel } = useSaveLater();
  const question = questions[index];
  const answer = drafts[question.questionId] ?? question.answer ?? "";

  // 질문의 답은 답할 때마다 저장된다(API 18). 여기서는 지금 단계만 저장한다.
  async function saveLater() {
    const message = await save({ currentStep: 3 });
    if (message !== null) setNotice(message);
  }

  function openQuestion(questionId) {
    setIndex(questions.findIndex((item) => item.questionId === questionId));
    setIsComplete(false);
    setNotice("");
  }

  async function submit(status, text) {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsAnswering(true);
    setNotice("");
    try {
      const saved = await saveAnswer(question, { status, answer: text });
      setQuestions((previous) => previous.map((item) => item.questionId === question.questionId ? { ...item, status: saved.status, answer: saved.answer } : item));
      if (status === "ANSWERED") {
        setDrafts((previous) => {
          const next = { ...previous };
          delete next[question.questionId];
          return next;
        });
      }
      if (index === questions.length - 1) setIsComplete(true);
      else setIndex(index + 1);
    } catch (failure) {
      if (failure.status !== 401) setNotice(getRequestErrorMessage(failure, "답을 저장하지 못했어요. 다시 시도해 주세요."));
    } finally {
      inFlight.current = false;
      setIsAnswering(false);
    }
  }

  // 지금 질문보다 앞에서 답하거나 건너뛴 질문만 아래에 쌓는다. 앞 질문으로 돌아가면 그 뒤 질문은 목록에서 빠진다.
  const answeredBefore = questions.filter((item, itemIndex) => itemIndex < index && item.status !== "PENDING");

  return (
    <div className="mt-10 grid grid-cols-[minmax(0,1fr)_320px] items-start gap-4">
      <div className="flex min-w-0 flex-col gap-3">
        {isComplete ? (
          <AiQuestionsComplete questions={questions} onEdit={openQuestion} />
        ) : (
          <>
            <RetroDarkCard border="start-card" aria-labelledby="ai-question-title">
              {/* 답을 저장하는 동안 버튼을 막는다. */}
              <fieldset disabled={isAnswering} aria-busy={isAnswering} className="min-w-0">
                <AiQuestionForm
                  key={question.questionId}
                  size="lg"
                  tone="dark"
                  questionId="ai-question-title"
                  category={<Badge tone="tag" size="sm">{question.tag}</Badge>}
                  progress={`${index + 1} / ${questions.length}`}
                  progressLabel={`총 ${questions.length}개 중 ${index + 1}번째 질문`}
                  source={question.quote && (
                    <>
                      내 자료의 <mark className="rounded bg-yellow-400 px-[3px] text-ink-950">“{question.quote}”</mark> 에서 더 물어볼게요
                    </>
                  )}
                  question={question.content}
                  placeholder="떠오르는 대로 짧게 써도 괜찮아요"
                  answer={answer}
                  onAnswerChange={(value) => { setDrafts((previous) => ({ ...previous, [question.questionId]: value })); setNotice(""); }}
                  // 첫 질문은 자료 단계로, 두 번째부터는 앞 질문으로 돌아간다(R-16).
                  backLabel={index === 0 ? "← 자료로" : "← 이전 질문"}
                  backHref={index === 0 ? getStepHref("materials") : undefined}
                  onBack={index === 0 ? undefined : () => { setIndex(index - 1); setNotice(""); }}
                  onAnswer={(trimmedAnswer) => submit("ANSWERED", trimmedAnswer)}
                  onSkip={() => submit("SKIPPED")}
                />
              </fieldset>
            </RetroDarkCard>
            {answeredBefore.length > 0 && (
              <AnsweredQuestionList questions={answeredBefore} label="답한 질문" onEdit={openQuestion} />
            )}
          </>
        )}
        <p role="status" className={notice || isAnswering ? "text-body-sm text-ink-muted" : "sr-only"}>
          {isAnswering ? "답을 저장하고 있어요…" : notice}
        </p>
      </div>

      <RetroSideCard titleId="ai-question-guide-title" title="AI가 찾은 더 물어볼 곳">
        <QuestionProgressList questions={questions} currentIndex={isComplete ? null : index} />
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 pt-4">
          <TextLink href={getStepHref("materials")}>← 자료 고치기</TextLink>
          <TextLink onClick={saveLater} disabled={isSaving} aria-busy={isSaving}>{isSaving ? "저장하는 중…" : "나중에 이어쓰기"}</TextLink>
          <SavedTime label={savedLabel} />
        </div>
      </RetroSideCard>
    </div>
  );
}
