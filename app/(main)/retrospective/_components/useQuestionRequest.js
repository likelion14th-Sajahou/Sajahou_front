"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/AuthProvider";
import { requestQuestions } from "@/lib/retrospectiveApi";
import { getRequestErrorMessage, useRetrospectivePreview } from "./RetrospectivePreview";

const ERROR_MESSAGES = {
  AI_TIMEOUT: "질문을 만드는 데 시간이 너무 오래 걸렸어요. 다시 시도해 주세요.",
  AI_FAILED: "질문을 만들지 못했어요. 다시 시도해 주세요.",
  AI_IN_PROGRESS: "질문을 만들고 있어요. 잠시 후 다시 시도해 주세요.",
  ATTACHMENT_PENDING: "첨부를 아직 읽고 있어요. 잠시 후 다시 시도해 주세요.",
};

function getQuestionErrorMessage(failure) {
  if (failure.kind === "timeout") return ERROR_MESSAGES.AI_TIMEOUT;
  return ERROR_MESSAGES[failure.code] ?? getRequestErrorMessage(failure, "질문을 받지 못했어요. 잠시 후 다시 시도해 주세요.");
}

// 'AI 질문 받기'(R-14, API 17). 질문을 받으면 질문 단계로 넘어간다.
// 답을 쓴 뒤 자료가 바뀌었으면 서버가 409 MATERIAL_CHANGED를 주고, 확인 문구에서 이어 쓰기·새로 만들기를 고른다.
export function useQuestionRequest() {
  const router = useRouter();
  const { authenticatedRequest } = useAuth();
  const { session, getStepHref, refreshCurrent } = useRetrospectivePreview();
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
      await requestQuestions(session.id, mode, { signal: controller.signal, request: authenticatedRequest });
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
      return getQuestionErrorMessage(failure);
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
