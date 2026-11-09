"use client";

import { useMockData } from "@/components/layout/MockDataProvider";
import Modal from "@/components/ui/Modal";
import { useState } from "react";
import NewProjectForm from "./NewProjectForm";

const TITLE_ID = "new-project-title";

// 홈 프로젝트 타일과 프로젝트 목록이 함께 쓰는 '새 프로젝트' 팝업이다(H-10, H-23).
export default function NewProjectModal({ open, onClose }) {
  const { addProject } = useMockData();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function createProject(values) {
    if (busy) return;
    setBusy(true); setError("");
    try { await addProject(values); onClose(); } catch (error) { setError(error.message); } finally { setBusy(false); }
  }

  return (
    <Modal open={open} onClose={busy ? () => {} : onClose} aria-labelledby={TITLE_ID}>
      <fieldset disabled={busy} className="min-w-0">
        <NewProjectForm titleId={TITLE_ID} onCancel={onClose} onCreate={createProject} />
        {error && <p role="alert">{error}</p>}
      </fieldset>
    </Modal>
  );
}
