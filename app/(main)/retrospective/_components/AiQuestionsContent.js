"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/AuthProvider";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TextLink from "@/components/ui/TextLink";
import { answerQuestion, getRetrospective, requestQuestions } from "@/lib/retrospectiveApi";
import RetrospectiveSteps from "./RetrospectiveSteps";
import AiQuestionsSession from "./AiQuestionsSession";
import { getRequestErrorMessage, useRetrospectivePreview } from "./RetrospectivePreview";
import { useReviewDraftRequest } from "./useReviewDraftRequest";

// 자료가 부족해 질문을 만들지 못했을 때(R-15).
function InsufficientMaterial() {
  const { getStepHref } = useRetrospectivePreview();
  const review = useReviewDraftRequest();

  return (
    <Card as="section" size="md" className="mt-7 flex flex-col gap-4 rounded-[28px]" aria-labelledby="insufficient-material-title">
      <h2 id="insufficient-material-title" className="text-title tracking-[-0.02em]">세션 자료나 메모를 조금만 더 올려 주세요</h2>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TextLink href={getStepHref("materials")}>← 자료로</TextLink>
        <Button onClick={review.openReview} disabled={review.isCreating} aria-busy={review.isCreating}>
          {review.isCreating ? "정리하는 중…" : "이대로 정리하기"}
        </Button>
      </div>
      {review.error && <p role="alert" className="text-body-sm text-error">{review.error}</p>}
    </Card>
  );
}

// 3단계 AI 질문. 저장된 질문과 답을 불러온다(API 13). 아직 질문이 없으면 그때 질문을 받는다(API 17).
// 과제 회고(R-23)는 과제 중심 질문이고, 마지막은 '이번 과제에서 다음에도 가져가고 싶은 것'이다(서버가 고른다).
function Questions() {
  const router = useRouter();
  const { authenticatedRequest } = useAuth();
  const { retrospective, getStepHref } = useRetrospectivePreview();
  const retrospectiveId = retrospective?.id;
  const startHref = getStepHref();
  const [loaded, setLoaded] = useState(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // 시작하지 않은 회고는 시작 화면에서 '시작하기'로 연다.
    if (!retrospectiveId) {
      router.replace(startHref);
      return;
    }
    const controller = new AbortController();
    const options = { signal: controller.signal, request: authenticatedRequest };
    getRetrospective(retrospectiveId, options)
      .then(async (detail) => {
        if (detail.questions.length) return { questions: detail.questions, insufficient: false };
        const result = await requestQuestions(retrospectiveId, "AUTO", options);
        return { questions: result.questions, insufficient: result.insufficientMaterial };
      })
      .then(setLoaded)
      .catch((failure) => {
        if (controller.signal.aborted || failure.name === "AbortError" || failure.status === 401) return;
        setError(getRequestErrorMessage(failure, "질문을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."));
      });
    return () => controller.abort();
  }, [retrospectiveId, startHref, authenticatedRequest, router, reloadKey]);

  if (!loaded) {
    return (
      <Card as="section" size="md" className="mt-7 flex flex-wrap items-center gap-3">
        {error ? (
          <>
            <p role="alert" className="text-body-sm text-error">{error}</p>
            <Button size="sm" variant="secondary" onClick={() => { setError(""); setReloadKey((key) => key + 1); }}>다시 시도</Button>
          </>
        ) : (
          <p role="status" className="text-body-sm text-ink-muted">질문을 불러오는 중이에요.</p>
        )}
      </Card>
    );
  }

  if (loaded.insufficient || !loaded.questions.length) return <InsufficientMaterial />;

  return (
    <AiQuestionsSession
      initialQuestions={loaded.questions}
      saveAnswer={(question, values) => answerQuestion(question.questionId, values, { request: authenticatedRequest })}
    />
  );
}

export default function AiQuestionsContent() {
  return (
    <>
      <RetrospectiveSteps currentStep={2} />
      <Questions />
    </>
  );
}
