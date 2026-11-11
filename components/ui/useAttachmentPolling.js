"use client";

import { useEffect, useRef, useState } from "react";
import { getAttachment } from "@/lib/attachmentApi";

const POLL_INTERVAL_MS = 1500;
const MAX_ATTEMPTS = 80;

// 올린 첨부의 읽기 상태(API 9)를 1.5초마다 확인한다. 회고 자료와 프로젝트 기록이 함께 쓴다.
// attachments 중 extractStatus가 PENDING인 것만 확인하고, 하나라도 바뀌면 onUpdate(results)를 부른다.
// results는 9번 응답(attachmentId, extractStatus 등) 목록이다. 2분쯤 지나도 그대로면 error를 알려 준다.
export default function useAttachmentPolling(attachments, onUpdate, { request } = {}) {
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const latestUpdate = useRef(onUpdate);
  useEffect(() => { latestUpdate.current = onUpdate; });
  // 확인할 첨부가 바뀔 때만 다시 시작한다(목록 배열이 새로 만들어져도 그대로면 이어서 확인한다).
  const pendingIds = attachments.filter(({ extractStatus }) => extractStatus === "PENDING").map(({ attachmentId }) => attachmentId).join(",");

  useEffect(() => {
    if (!pendingIds) return;
    const controller = new AbortController();
    let timer;
    let attempts = 0;
    async function poll() {
      try {
        const results = await Promise.all(pendingIds.split(",").map((id) => getAttachment(id, { signal: controller.signal, request })));
        if (controller.signal.aborted) return;
        if (results.some(({ extractStatus }) => extractStatus !== "PENDING")) latestUpdate.current(results);
        else if (++attempts < MAX_ATTEMPTS) timer = setTimeout(poll, POLL_INTERVAL_MS);
        else setError("첨부 상태 확인이 오래 걸리고 있어요. 다시 확인해 주세요.");
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure.message);
      }
    }
    timer = setTimeout(poll, POLL_INTERVAL_MS);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [pendingIds, attempt, request]);

  return {
    error,
    retry: () => { setError(""); setAttempt((value) => value + 1); },
  };
}
