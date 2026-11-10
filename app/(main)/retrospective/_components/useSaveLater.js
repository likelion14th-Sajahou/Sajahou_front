"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import { formatTime } from "@/lib/formatDate";
import { saveRetrospective } from "@/lib/retrospectiveApi";
import { getRequestErrorMessage, useRetrospectivePreview } from "./RetrospectivePreview";

// 2~4단계의 '나중에 이어쓰기'(R-03). 지금 단계와 보낸 자료를 저장하고, 저장 시각을 'HH:MM 저장됨'으로 보여 준다.
// 과제 회고와 화면 확인용 주소는 아직 저장하지 않는다(canSave=false).
export function useSaveLater({ canSave = true } = {}) {
  const { authenticatedRequest } = useAuth();
  const { session, isAssignment, applySaved } = useRetrospectivePreview();
  const [isSaving, setIsSaving] = useState(false);
  const inFlight = useRef(false);

  // 성공하면 "", 실패하면 안내 문구, 이미 저장 중이면 null을 돌려준다.
  async function save(changes) {
    if (inFlight.current) return null;
    if (!canSave || isAssignment) return "이 화면은 아직 저장할 수 없어요.";
    if (!session.id) return "회고를 먼저 시작해 주세요.";
    inFlight.current = true;
    setIsSaving(true);
    try {
      applySaved(await saveRetrospective(session.id, changes, { request: authenticatedRequest }));
      return "";
    } catch (failure) {
      return failure.status === 401 ? "" : getRequestErrorMessage(failure, "저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      inFlight.current = false;
      setIsSaving(false);
    }
  }

  const showsSavedTime = canSave && !isAssignment && Boolean(session.lastSavedAt);

  return {
    save,
    isSaving,
    savedLabel: showsSavedTime ? `${formatTime(session.lastSavedAt)} 저장됨` : "",
  };
}

export function SavedTime({ label, className = "" }) {
  return <span role="status" className={`text-label whitespace-nowrap text-ink-subtle ${className}`}>{label}</span>;
}
