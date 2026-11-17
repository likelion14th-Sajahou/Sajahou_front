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
import { useRetrospective } from "./RetrospectiveProvider";
import { SavedTime, useSaveLater } from "./useSaveLater";
import { getRequestErrorMessage } from "@/lib/requestErrorMessage";
import { readAnswerDrafts, writeAnswerDrafts } from "@/lib/retrospectiveAnswerDrafts";
import { retrospectiveQuestionSource } from "@/lib/retrospectiveQuestionSource";

const firstPendingIndex = (questions) => Math.max(0, questions.findIndex(({ status }) => status === "PENDING"));
const isAllDone = (questions) => questions.length > 0 && questions.every(({ status }) => status !== "PENDING");

// 3단계 AI 질문(R-16~18). 한 번에 한 질문씩 답하거나 건너뛴다.
// saveAnswer(question, { status, answer })는 저장된 { status, answer }를 돌려준다. 실패하면 넘어가지 않는다.
// 다시 들어오면 임시 저장한 답변을 먼저 열고, 없으면 처음으로 안 푼 질문부터 연다.
export default function AiQuestionsSession({ initialQuestions, attachments = [], initialDrafts = {}, draftKey, draftError = "", saveAnswer }) {
  const { getStepHref } = useRetrospective();
  const [questions, setQuestions] = useState(initialQuestions);
  const [index, setIndex] = useState(() => {
    const draftIndex = initialQuestions.findIndex((item) => Object.hasOwn(initialDrafts, item.questionId));
    return draftIndex >= 0 ? draftIndex : firstPendingIndex(initialQuestions);
  });
  const [isComplete, setIsComplete] = useState(() => isAllDone(initialQuestions) && !Object.keys(initialDrafts).length);
  // 저장하지 않고 쓰던 답. 다른 질문으로 갔다가 돌아와도 남는다(R-16).
  const [drafts, setDrafts] = useState(initialDrafts);
  const [isAnswering, setIsAnswering] = useState(false);
  const [notice, setNotice] = useState(draftError);
  const inFlight = useRef(false);
  const { save, isSaving, savedLabel } = useSaveLater();
  const question = questions[index];
  const source = retrospectiveQuestionSource(question, attachments);
  const answer = drafts[question.questionId] ?? question.answer ?? "";

  // 미제출 답은 로컬에 저장하고, API 14로 현재 단계만 저장한다. 답변 완료 처리는 하지 않는다.
  async function saveLater() {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      writeAnswerDrafts(window.localStorage, draftKey, questions, drafts);
      const message = await save({ currentStep: 3 });
      if (message !== null) setNotice(message
        ? `입력 중인 답변은 이 브라우저에 저장했지만 회고 단계 저장에 실패했어요. ${message}`
        : "입력 중인 답변을 이 브라우저에 임시 저장했어요.");
    } catch {
      setNotice("답변을 임시 저장하지 못했어요. 브라우저 저장 공간과 설정을 확인한 뒤 다시 시도해 주세요.");
    } finally {
      inFlight.current = false;
    }
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
      const nextDrafts = { ...drafts };
      delete nextDrafts[question.questionId];
      setDrafts(nextDrafts);
      try {
        const storedDrafts = readAnswerDrafts(window.localStorage, draftKey, questions);
        delete storedDrafts[question.questionId];
        writeAnswerDrafts(window.localStorage, draftKey, questions, storedDrafts);
      } catch {
        setNotice("답변은 제출했지만 이 브라우저의 임시 저장 내용을 정리하지 못했어요.");
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
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex min-w-0 flex-col gap-3">
        {isComplete ? (
          <AiQuestionsComplete questions={questions} onEdit={openQuestion} />
        ) : (
          <>
            <RetroDarkCard aria-labelledby="ai-question-title">
              {/* 답을 저장하는 동안 버튼을 막는다. */}
              <fieldset disabled={isAnswering || isSaving} aria-busy={isAnswering || isSaving} className="min-w-0">
                <AiQuestionForm
                  key={question.questionId}
                  size="lg"
                  tone="dark"
                  questionId="ai-question-title"
                  category={<Badge tone="tag" size="sm">{question.tag}</Badge>}
                  progress={`${index + 1} / ${questions.length}`}
                  progressLabel={`총 ${questions.length}개 중 ${index + 1}번째 질문`}
                  source={source && (
                    <span className="font-display leading-[26.6px] [overflow-wrap:anywhere]">
                      {source.label && <><span className="rounded bg-white/10 px-1.5 py-0.5 text-white">{source.label}</span>{source.isEntire ? " · " : "의 "}</>}
                      <mark className="box-decoration-clone rounded bg-yellow-400 px-[3px] py-0.5 leading-[18px] text-ink-950">{source.isEntire ? source.quote : `“${source.quote}”`}</mark> 부분에서 물어봐요
                    </span>
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
          {(isComplete || index > 0) && (
            <TextLink href={getStepHref("materials")}>← 자료 고치기</TextLink>
          )}
          <TextLink onClick={saveLater} disabled={isSaving || isAnswering} aria-busy={isSaving}>{isSaving ? "저장하는 중…" : "저장"}</TextLink>
          <SavedTime label={savedLabel} />
        </div>
        <p className="pt-2 text-caption text-ink-subtle">제출 전 답변은 저장을 누르면 이 브라우저에만 저장돼요. 브라우저 데이터를 삭제하면 사라져요.</p>
      </RetroSideCard>
    </div>
  );
}
