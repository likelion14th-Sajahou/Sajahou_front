"use client";

import { useMockData } from "@/components/layout/MockDataProvider";
import Modal from "@/components/ui/Modal";
import { MOCK_TODAY } from "@/lib/mock/projects";
import NewProjectForm from "./NewProjectForm";

const TITLE_ID = "new-project-title";

// 홈 프로젝트 타일과 프로젝트 목록이 함께 쓰는 '새 프로젝트' 팝업이다(H-10, H-23).
export default function NewProjectModal({ open, onClose }) {
  const { addProject } = useMockData();

  function createProject({ name, roles }) {
    addProject({
      id: crypto.randomUUID(),
      name,
      subtitle: "",
      status: "active",
      roles,
      startedAt: MOCK_TODAY.date,
      shape: "pentagon",
      color: "blue",
      records: [],
    });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} aria-labelledby={TITLE_ID}>
      <NewProjectForm titleId={TITLE_ID} onCancel={onClose} onCreate={createProject} />
    </Modal>
  );
}
