"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import { getJobPosting } from "@/lib/matchingApi";
import { getRequestErrorMessage } from "@/lib/requestErrorMessage";

// 주소에서 jobPostingId를 지운다. 없는 공고라 다시 불러올 필요가 없을 때 쓴다.
function removeJobPostingIdFromAddress() {
  const url = new URL(window.location.href);
  url.searchParams.delete("jobPostingId");
  window.history.replaceState(null, "", url);
}

// 매칭 결과 복원(이슈 #42, API 39). 주소에 jobPostingId가 있으면 저장된 매칭 결과를 불러와 onRestore(data)로 넘긴다.
// 새로고침·뒤로 가기·링크 공유로 들어왔을 때 쓰인다. 공고 목록 API가 없어 주소에 남긴 id로만 복원한다.
// 다른 화면에 다녀와 이 화면이 다시 보이면(cacheComponents) effect가 다시 실행되므로, 이미 다룬 id는 다시 부르지 않는다.
export default function useJobPostingRestore(jobPostingId, onRestore) {
  const { authenticatedRequest } = useAuth();
  // 이미 불러왔거나 더 볼 필요가 없는 공고 id들이다.
  const handledIdsRef = useRef(new Set());
  const latestOnRestore = useRef(onRestore);
  useEffect(() => { latestOnRestore.current = onRestore; });
  // 불러오기 결과다. id가 지금 주소의 id와 같으면 끝난 것이고(성공·실패·새로 찾음), error가 있으면 실패한 것이다.
  const [result, setResult] = useState({ id: null, error: "", canRetry: false });
  const [attempt, setAttempt] = useState(0);
  const id = jobPostingId ? String(jobPostingId) : null;

  useEffect(() => {
    if (!id || handledIdsRef.current.has(id)) return;
    const controller = new AbortController();
    getJobPosting(id, { signal: controller.signal, request: authenticatedRequest })
      .then((data) => {
        if (controller.signal.aborted) return;
        handledIdsRef.current.add(id);
        latestOnRestore.current(data);
        setResult({ id, error: "", canRetry: false });
      })
      .catch((failure) => {
        // 로그인이 풀리면(401) 화면이 로그인으로 바뀌므로 안내하지 않는다.
        if (controller.signal.aborted || failure.status === 401) return;
        if (failure.status === 404) {
          handledIdsRef.current.add(id);
          removeJobPostingIdFromAddress();
          setResult({ id, error: "찾는 매칭 결과가 없어요. 공고와 문항을 새로 넣어 주세요.", canRetry: false });
          return;
        }
        setResult({ id, error: getRequestErrorMessage(failure, "매칭 결과를 불러오지 못했어요. 잠시 후 다시 시도해 주세요."), canRetry: true });
      });
    return () => controller.abort();
  }, [id, attempt, authenticatedRequest]);

  const isCurrent = result.id === id;
  return {
    isRestoring: Boolean(id) && !isCurrent,
    error: isCurrent ? result.error : "",
    canRetry: isCurrent && result.canRetry,
    retry: () => {
      setResult({ id: null, error: "", canRetry: false });
      setAttempt((value) => value + 1);
    },
    // 새로 찾으면 그 결과를 보여 주므로, 주소에 있던 공고와 새 공고는 다시 불러오지 않는다.
    markHandled: (newJobPostingId) => {
      if (id) handledIdsRef.current.add(id);
      handledIdsRef.current.add(String(newJobPostingId));
      setResult({ id, error: "", canRetry: false });
    },
  };
}
