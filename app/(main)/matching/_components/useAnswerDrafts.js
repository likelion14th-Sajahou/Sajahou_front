"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import { createAnswerDraft } from "@/lib/matchingApi";
import { getAiErrorMessage } from "@/lib/requestErrorMessage";

// 문항별 답 초안(M-08, API 37). 공고를 저장하면 모든 문항에 동시에 요청하고, 끝난 문항부터 보여 준다.
// 같은 문항은 요청이 끝나기 전에 다시 보내지 않는다(백엔드 확인: 같은 문항의 동시 호출만 피하면 됨).
// drafts[questionId] = { status: "loading" } | { status: "done", answer } | { status: "error", error } | { status: "empty" }
// empty는 저장된 결과를 불러왔는데(39번) 아직 초안이 없는 문항이다.
export default function useAnswerDrafts() {
  const { authenticatedRequest } = useAuth();
  const [drafts, setDrafts] = useState({});
  // 문항별로 진행 중인 요청이다. 있으면 같은 문항을 다시 보내지 않는다.
  const controllersRef = useRef(new Map());

  // 화면을 떠나면 진행 중인 요청을 모두 취소한다.
  useEffect(() => {
    const controllers = controllersRef.current;
    return () => controllers.forEach((controller) => controller.abort());
  }, []);

  const setDraft = (questionId, draft) => setDrafts((previous) => ({ ...previous, [questionId]: draft }));

  async function generate(questionId) {
    const controllers = controllersRef.current;
    if (controllers.has(questionId)) return;
    const controller = new AbortController();
    controllers.set(questionId, controller);
    setDraft(questionId, { status: "loading" });
    try {
      const answer = await createAnswerDraft(questionId, { signal: controller.signal, request: authenticatedRequest });
      setDraft(questionId, { status: "done", answer });
    } catch (failure) {
      // 로그인이 풀리면(401) 화면이 로그인으로 바뀌므로 안내하지 않는다.
      if (controller.signal.aborted || failure.status === 401) return;
      setDraft(questionId, { status: "error", error: getAiErrorMessage(failure, "초안을 만들지 못했어요. 잠시 후 다시 시도해 주세요.") });
    } finally {
      if (controllers.get(questionId) === controller) controllers.delete(questionId);
    }
  }

  function cancelAll() {
    controllersRef.current.forEach((controller) => controller.abort());
    controllersRef.current.clear();
  }

  // 새 공고의 문항들로 처음부터 만든다. 이전 공고의 요청은 취소한다.
  function start(questionIds) {
    cancelAll();
    setDrafts({});
    questionIds.forEach(generate);
  }

  // 저장된 매칭 결과(39번)의 초안으로 채운다. questions는 39번 응답의 questions다.
  // 초안이 없는 문항(answer null)은 바로 만들지 않는다. 만드는 중에 새로고침했다면 서버에서 아직 만들고 있을 수 있어서,
  // 같은 문항을 겹쳐 부르지 않도록 '다시 만들기'를 눌렀을 때만 만든다.
  function restore(questions) {
    cancelAll();
    setDrafts(Object.fromEntries(questions.map(({ questionId, answer }) => [questionId, answer ? { status: "done", answer } : { status: "empty" }])));
  }

  return { drafts, start, restore, retry: generate };
}
