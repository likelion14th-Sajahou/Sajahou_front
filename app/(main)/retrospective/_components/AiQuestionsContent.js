"use client";

import { useCallback } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { answerQuestion, getRetrospective, requestQuestions } from "@/lib/retrospectiveApi";
import RetrospectiveSteps from "./RetrospectiveSteps";
import AiQuestionsSession from "./AiQuestionsSession";
import RetroDarkCard from "./RetroDarkCard";
import { useRetrospective } from "./RetrospectiveProvider";
import StepLoadCard from "./StepLoadCard";
import useStepData from "./useStepData";
import { useReviewDraftRequest } from "./useReviewDraftRequest";
import { getRequestErrorMessage } from "@/lib/requestErrorMessage";
import AiWaitingNotice from "@/components/ui/AiWaitingNotice";
import { answerDraftKey, readAnswerDrafts } from "@/lib/retrospectiveAnswerDrafts";

// 자료가 부족해 질문을 만들지 못했을 때(R-15). 프로토타입처럼 질문 카드와 같은 진한 카드다.
function InsufficientMaterial() {
  const { getStepHref } = useRetrospective();
  const review = useReviewDraftRequest();

  return (
    <RetroDarkCard aria-labelledby="insufficient-material-title">
      <h2 id="insufficient-material-title" className="text-body leading-6 text-white">질문할 자료가 부족해요. 세션 자료나 메모를 조금만 더 올려 주세요.</h2>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-locked pt-4">
        <Button variant="inverse-muted" href={getStepHref("materials")}>← 자료로</Button>
        <Button variant="cta" onClick={review.openReview} disabled={review.isCreating} aria-busy={review.isCreating}>
          {review.isCreating ? "정리하는 중…" : "이대로 정리하기"}
        </Button>
      </div>
      <AiWaitingNotice active={review.isCreating} doing="지금 자료로 회고록과 스토리 카드 초안을 만들고 있어요" className="text-locked!" />
      {review.error && <p role="alert" className="text-body-sm text-tint-red">{review.error}</p>}
    </RetroDarkCard>
  );
}

// 3단계 AI 질문. 저장된 질문과 답을 불러온다(API 13). 아직 질문이 없으면 그때 질문을 받는다(API 17).
// 과제 회고(R-23)는 과제 중심 질문이고, 마지막은 '이번 과제에서 다음에도 가져가고 싶은 것'이다(서버가 고른다).
const toErrorMessage = (failure) => getRequestErrorMessage(failure, "질문을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");

function Questions() {
  const { authenticatedRequest, user } = useAuth();
  const userId = user?.id;
  // 저장된 질문을 불러오고, 아직 없으면 그때 만든다(API 17). 이 브라우저에 임시 저장한 답도 함께 읽는다.
  const load = useCallback(async (retrospectiveId, options) => {
    const detail = await getRetrospective(retrospectiveId, options);
    const result = detail.questions.length
      ? { questions: detail.questions, attachments: detail.attachments, insufficient: false }
      : await requestQuestions(retrospectiveId, "AUTO", options).then((created) => (
        { questions: created.questions, attachments: detail.attachments, insufficient: created.insufficientMaterial }));
    const draftKey = answerDraftKey(userId, retrospectiveId);
    try {
      return { ...result, draftKey, drafts: readAnswerDrafts(window.localStorage, draftKey, result.questions) };
    } catch {
      return { ...result, draftKey, drafts: {}, draftError: "이 브라우저에 임시 저장한 답변을 불러오지 못했어요." };
    }
  }, [userId]);
  const { data: loaded, error, retry } = useStepData(load, toErrorMessage);

  if (!loaded) return <StepLoadCard error={error} onRetry={retry}>질문을 불러오는 중이에요.</StepLoadCard>;

  if (loaded.insufficient || !loaded.questions.length) return <InsufficientMaterial />;

  return (
    <AiQuestionsSession
      key={loaded.draftKey}
      initialQuestions={loaded.questions}
      attachments={loaded.attachments}
      initialDrafts={loaded.drafts}
      draftKey={loaded.draftKey}
      draftError={loaded.draftError}
      saveAnswer={(question, values) => answerQuestion(question.questionId, values, { request: authenticatedRequest })}
    />
  );
}

export default function AiQuestionsContent() {
  return (
    <>
      {/* 제목·단계·카드 사이 간격은 시작·자료 화면과 같다(프로토타입 11/13). */}
      <RetrospectiveSteps currentStep={2} />
      <Questions />
    </>
  );
}
