"use client";

import { useMockData } from "@/components/layout/MockDataProvider";
import Modal from "@/components/ui/Modal";
import DrawnBorder from "@/components/ui/DrawnBorder";
import { useRef, useState } from "react";
import NewProjectForm from "./NewProjectForm";

const TITLE_ID = "new-project-title";

// 홈 프로젝트 타일과 프로젝트 목록이 함께 쓰는 '새 프로젝트' 팝업이다(H-10, H-23).
export default function NewProjectModal({ open, onClose, onCreated }) {
  const { addProject } = useMockData();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);

  async function createProject(values) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true); setError("");
    try {
      const result = await addProject(values);
      onClose();
      onCreated?.(result);
    } catch (error) { setError(error.message); }
    finally { inFlight.current = false; setBusy(false); }
  }

  return (
    // 모서리는 공용 테두리 선의 둥글기(약 24px)에 맞춘다. 손그림 테두리가 팝업 가장자리 밖으로 나가므로 팝업은 자르지 않고, 스크롤은 안쪽 칸이 맡는다(스토리 카드 팝업과 같은 방식).
    <Modal
      open={open}
      size="project"
      className="overflow-visible! rounded-[24px]! backdrop:bg-[#1f2433]/40!"
      contentClassName="max-h-[calc(100dvh-32px)] overflow-y-auto rounded-[24px] px-[26px] pt-[38px] pb-[34px] sm:px-[38px]"
      border={<DrawnBorder variant="start-card" />}
      onClose={busy ? () => {} : onClose}
      onCancel={(event) => { if (busy) event.preventDefault(); }}
      aria-labelledby={TITLE_ID}
    >
      <fieldset disabled={busy} className="min-w-0">
        <NewProjectForm titleId={TITLE_ID} onCancel={onClose} onCreate={createProject} busy={busy} />
        {error && <p role="alert">{error}</p>}
      </fieldset>
    </Modal>
  );
}
