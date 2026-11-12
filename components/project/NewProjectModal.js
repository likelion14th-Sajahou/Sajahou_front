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
    <Modal open={open} size="project" className="rounded-[32px]! backdrop:bg-[#1f2433]/40!" contentClassName="px-[26px] pt-[38px] pb-[34px] sm:px-[38px]" onClose={busy ? () => {} : onClose} onCancel={(event) => { if (busy) event.preventDefault(); }} aria-labelledby={TITLE_ID}>
      <DrawnBorder variant="new-project-dialog" />
      <fieldset disabled={busy} className="min-w-0">
        <NewProjectForm titleId={TITLE_ID} onCancel={onClose} onCreate={createProject} busy={busy} />
        {error && <p role="alert">{error}</p>}
      </fieldset>
    </Modal>
  );
}
