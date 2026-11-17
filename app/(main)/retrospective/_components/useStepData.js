"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/AuthProvider";
import { useRetrospective } from "./RetrospectiveProvider";

// 회고 단계 화면(자료·AI 질문·검토)이 그 단계에 필요한 데이터를 불러온다.
// - 시작하지 않은 회고(id 없음)는 시작 화면으로 보낸다.
// - 화면을 떠나거나 다시 불러오면 이전 요청을 취소하고, 로그인 만료(401)는 AuthProvider가 처리하므로 안내하지 않는다.
// load(retrospectiveId, { signal, request }): 단계 데이터를 돌려주는 함수. 바뀔 때마다 다시 불러오므로 useCallback으로 넘긴다.
// toErrorMessage(failure): 실패 안내 문구. 화면마다 문구가 달라 모듈 함수로 넘긴다.
export default function useStepData(load, toErrorMessage) {
  const router = useRouter();
  const { authenticatedRequest } = useAuth();
  const { retrospective, getStepHref } = useRetrospective();
  const retrospectiveId = retrospective?.id;
  const startHref = getStepHref();
  const [{ data, error }, setState] = useState({ data: null, error: "" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!retrospectiveId) {
      router.replace(startHref);
      return;
    }
    const controller = new AbortController();
    load(retrospectiveId, { signal: controller.signal, request: authenticatedRequest })
      .then((result) => { if (!controller.signal.aborted) setState({ data: result, error: "" }); })
      .catch((failure) => {
        if (controller.signal.aborted || failure.name === "AbortError" || failure.status === 401) return;
        setState((previous) => ({ ...previous, error: toErrorMessage(failure) }));
      });
    return () => controller.abort();
  }, [load, toErrorMessage, retrospectiveId, startHref, authenticatedRequest, router, reloadKey]);

  function retry() {
    setState((previous) => ({ ...previous, error: "" }));
    setReloadKey((key) => key + 1);
  }

  return { retrospectiveId, data, error, retry };
}
