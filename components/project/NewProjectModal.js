"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useMockData } from "@/components/layout/MockDataProvider";
import FormDialog from "@/components/ui/FormDialog";
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
    <FormDialog
      open={open}
      onClose={onClose}
      busy={busy}
      titleId={TITLE_ID}
      icon={<Image src="/images/stars/star-03.png" alt="" width={56} height={56} className="size-14" />}
      title="새 프로젝트"
      description="프로젝트 종류와 이름, 역할을 정해요."
    >
      <fieldset disabled={busy} className="min-w-0">
        <NewProjectForm onCancel={onClose} onCreate={createProject} busy={busy} />
        {error && <p role="alert" className="mt-3 text-center text-label text-error">{error}</p>}
      </fieldset>
    </FormDialog>
  );
}
