"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/AuthProvider";
import { createReviewDraft } from "@/lib/retrospectiveApi";
import { useRetrospectivePreview } from "./RetrospectivePreview";
import { getAiErrorMessage } from "./useQuestionRequest";

// '초안 확인하기'·'이대로 정리하기'. 지금 답으로 회고록과 카드 초안을 만든 뒤(API 19) 검토 단계로 간다.
// 검토에서 '← 질문으로' 가서 답을 고친 뒤 다시 누르면 고친 답으로 다시 만든다(R-17).
// 과제 회고는 회고 완료·과제 회고 분기(FE-24)에서 연결해서 아직 화면만 넘긴다.
export function useReviewDraftRequest() {
  const router = useRouter();
  const { authenticatedRequest } = useAuth();
  const { session, isAssignment, getStepHref, refreshCurrent } = useRetrospectivePreview();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const controllerRef = useRef(null);

  // 만드는 중에 화면을 떠나면 요청을 취소한다.
  useEffect(() => () => controllerRef.current?.abort(), []);

  async function openReview() {
    if (isAssignment) {
      router.push(getStepHref("review"));
      return;
    }
    const controller = new AbortController();
    controllerRef.current = controller;
    setIsCreating(true);
    setError("");
    try {
      await createReviewDraft(session.id, { signal: controller.signal, request: authenticatedRequest });
      await refreshCurrent();
      router.push(getStepHref("review"));
    } catch (failure) {
      if (controller.signal.aborted || failure.status === 401) return;
      setError(getAiErrorMessage(failure, "초안을 만들지 못했어요. 잠시 후 다시 시도해 주세요."));
    } finally {
      setIsCreating(false);
    }
  }

  return { openReview, isCreating, error };
}
