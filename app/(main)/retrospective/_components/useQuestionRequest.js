"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/AuthProvider";
import { requestQuestions } from "@/lib/retrospectiveApi";
import { useRetrospectivePreview } from "./RetrospectivePreview";
import { getAiErrorMessage } from "@/lib/requestErrorMessage";

// 'AI 질문 받기'(R-14, API 17). 질문을 받으면 질문 단계로 넘어간다.
// 답을 쓴 뒤 자료가 바뀌었으면 서버가 409 MATERIAL_CHANGED를 주고, 확인 문구에서 이어 쓰기·새로 만들기를 고른다.
export function useQuestionRequest() {
  const router = useRouter();
  const { authenticatedRequest } = useAuth();
  const { retrospective, getStepHref, refreshCurrent } = useRetrospectivePreview();
  const [isRequesting, setIsRequesting] = useState(false);
  // 자료가 바뀌었을 때 사라질 답 개수. null이면 확인 문구를 닫은 상태다.
  const [changedAnswerCount, setChangedAnswerCount] = useState(null);
  const controllerRef = useRef(null);

  // 질문을 만드는 중에 화면을 떠나면 요청을 취소한다.
  useEffect(() => () => controllerRef.current?.abort(), []);

  // mode: AUTO | CONTINUE | REGENERATE. 성공하거나 확인 문구를 띄우면 "", 실패하면 안내 문구를 돌려준다.
  async function request(mode) {
    const controller = new AbortController();
    controllerRef.current = controller;
    setIsRequesting(true);
    try {
      await requestQuestions(retrospective.id, mode, { signal: controller.signal, request: authenticatedRequest });
      setChangedAnswerCount(null);
      await refreshCurrent();
      router.push(getStepHref("questions"));
      return "";
    } catch (failure) {
      if (controller.signal.aborted || failure.status === 401) return "";
      if (failure.code === "MATERIAL_CHANGED") {
        setChangedAnswerCount(failure.detail?.answeredCount ?? 0);
        return "";
      }
      return getAiErrorMessage(failure, "질문을 받지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsRequesting(false);
    }
  }

  return {
    request,
    isRequesting,
    changedAnswerCount,
    closeChangeNotice: () => setChangedAnswerCount(null),
  };
}
