"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import TextLink from "@/components/ui/TextLink";
import NewProjectForm from "./NewProjectForm";
import SectionHeader from "./SectionHeader";

const MODAL_TITLE_ID = "new-project-title";

function ProjectRow({ project }) {
  const { id, name, recordCount, lastRecordedAt, shape, color } = project;

  return (
    <li className="flex items-center gap-3 rounded-2xl bg-canvas px-3 py-2.5">
      <ShapeCharacter shape={shape} color={color} size={34} />
      <Link href={`/projects/${id}`} className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-body text-ink">{name}</span>
        <span className="text-[12.5px] text-ink-subtle">
          기록 {recordCount} · {lastRecordedAt}
        </span>
      </Link>
      <Link
        href={`/projects/${id}?record=new`}
        aria-label={`${name} 기록 추가`}
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-title text-white"
      >
        +
      </Link>
    </li>
  );
}

export default function ProjectsCard({ initialProjects }) {
  const [projects, setProjects] = useState(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleCreate({ name }) {
    const today = new Date();

    // 프로젝트 API가 없어 화면 안에서만 추가한다. 새로고침하면 사라진다.
    setProjects((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name,
        recordCount: 0,
        lastRecordedAt: `${today.getMonth() + 1}/${today.getDate()}`,
        shape: "pentagon",
        color: "blue",
      },
    ]);
    setIsModalOpen(false);
  }

  return (
    <Card as="section" className="flex flex-col items-start gap-3.5">
      <SectionHeader title="프로젝트" />
      {projects.length > 0 ? (
        <ul className="flex w-full flex-col gap-2">
          {projects.map((project) => (
            <ProjectRow key={project.id} project={project} />
          ))}
        </ul>
      ) : (
        <p className="text-body-sm text-ink-subtle">진행 중인 프로젝트가 없어요</p>
      )}
      <TextLink onClick={() => setIsModalOpen(true)}>+ 새 프로젝트</TextLink>
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby={MODAL_TITLE_ID}
      >
        <NewProjectForm
          titleId={MODAL_TITLE_ID}
          onCancel={() => setIsModalOpen(false)}
          onCreate={handleCreate}
        />
      </Modal>
    </Card>
  );
}
