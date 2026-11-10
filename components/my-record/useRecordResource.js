"use client";

import { useEffect, useState } from "react";

// 요청 키와 취소 신호로 늦은 응답·사용자 전환 후의 응답을 버린다.
export default function useRecordResource(load, key, delayMs = 0) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      load(controller.signal).then((data) => {
        if (!controller.signal.aborted) setResult({ key, attempt, data });
      }).catch((error) => {
        if (!controller.signal.aborted) setResult({ key, attempt, error });
      });
    }, delayMs);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [load, key, attempt, delayMs]);
  const current = result?.key === key && result.attempt === attempt ? result : null;
  return { data: current?.data, error: current?.error, loading: !current,
    refresh: () => setAttempt((value) => value + 1) };
}
