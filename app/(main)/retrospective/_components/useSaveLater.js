"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import { formatTime } from "@/lib/formatDate";
import { saveRetrospective } from "@/lib/retrospectiveApi";
import { useRetrospectivePreview } from "./RetrospectivePreview";
import { getRequestErrorMessage } from "@/lib/requestErrorMessage";

// 2~4단계의 '나중에 이어쓰기'(R-03). 지금 단계와 보낸 자료를 저장하고, 저장 시각을 'HH:MM 저장됨'으로 보여 준다.
// 지금 보는 회고(세션 또는 과제)를 저장한다.
export function useSaveLater() {
  const { authenticatedRequest } = useAuth();
  const { retrospective, applySaved } = useRetrospectivePreview();
  const [isSaving, setIsSaving] = useState(false);
  const inFlight = useRef(false);

  // 성공하면 "", 실패하면 안내 문구, 이미 저장 중이면 null을 돌려준다.
  async function save(changes) {
    if (inFlight.current) return null;
    if (!retrospective?.id) return "회고를 먼저 시작해 주세요.";
    inFlight.current = true;
    setIsSaving(true);
    try {
      applySaved(await saveRetrospective(retrospective.id, changes, { request: authenticatedRequest }));
      return "";
    } catch (failure) {
      return failure.status === 401 ? "" : getRequestErrorMessage(failure, "저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      inFlight.current = false;
      setIsSaving(false);
    }
  }

  return {
    save,
    isSaving,
    savedLabel: retrospective?.lastSavedAt ? `${formatTime(retrospective.lastSavedAt)} 저장됨` : "",
  };
}

export function SavedTime({ label, className = "" }) {
  return <span role="status" className={`text-label whitespace-nowrap text-ink-subtle ${className}`}>{label}</span>;
}
