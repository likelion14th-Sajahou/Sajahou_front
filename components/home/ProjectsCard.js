"use client";

import { useState } from "react";
import Link from "next/link";
import { useMockData } from "@/components/layout/MockDataProvider";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import TextLink from "@/components/ui/TextLink";
import { MOCK_TODAY } from "@/lib/mock/projects";
import NewProjectForm from "./NewProjectForm";
import SectionHeader from "./SectionHeader";

const MODAL_TITLE_ID = "new-project-title";

function ProjectRow({ project, summary, action }) {
  const { id, name, shape, color } = project;

  return (
    <li className="flex items-center gap-3 rounded-2xl bg-canvas px-3 py-2.5">
      <ShapeCharacter shape={shape} color={color} size={34} />
      <Link href={`/projects/${id}`} className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-body text-ink">{name}</span>
        <span className="text-[12.5px] text-ink-subtle">{summary}</span>
      </Link>
      {action}
    </li>
  );
}

function ActiveProjectRow({ project }) {
  const { id, name, records, startedAt } = project;

  return (
    <ProjectRow
      project={project}
      summary={`기록 ${records.length} · ${records[0]?.date ?? startedAt}`}
      action={
        <Link
          href={`/projects/${id}?record=new`}
          aria-label={`${name} 기록 추가`}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-title text-white"
        >
          +
        </Link>
      }
    />
  );
}

function DoneProjectRow({ project }) {
  const { id, name, records, representativeCards } = project;

  return (
    <ProjectRow
      project={project}
      summary={`대표 카드 ${representativeCards.length}장 · 기록 ${records.length}`}
      action={
        <Link
          href={`/projects/${id}`}
          aria-label={`${name} 대표 카드 더 만들기`}
          className="shrink-0 text-label text-ink underline decoration-from-font [text-underline-position:from-font]"
        >
          카드 더 만들기
        </Link>
      }
    />
  );
}

export default function ProjectsCard() {
  const { projects, addProject } = useMockData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const activeProjects = projects.filter(({ status }) => status === "active");
  const doneProjects = projects.filter(({ status }) => status === "done");

  function handleCreate({ name, role }) {
    addProject({
      id: crypto.randomUUID(),
      name,
      subtitle: "",
      status: "active",
      role,
      startedAt: MOCK_TODAY.date,
      representativeCards: [],
      shape: "pentagon",
      color: "blue",
      records: [],
    });
    setIsModalOpen(false);
  }

  return (
    <Card as="section" className="flex flex-col items-start gap-3.5">
      <SectionHeader title="프로젝트" />
      {activeProjects.length > 0 ? (
        <ul className="flex w-full flex-col gap-2">
          {activeProjects.map((project) => (
            <ActiveProjectRow key={project.id} project={project} />
          ))}
        </ul>
      ) : (
        <p className="text-body-sm text-ink-subtle">진행 중인 프로젝트가 없어요</p>
      )}
      {doneProjects.length > 0 && (
        <>
          <p className="h-6 pt-1.5 pl-1 text-[12.5px] leading-5 text-ink-subtle">완료</p>
          <ul className="flex w-full flex-col gap-2">
            {doneProjects.map((project) => (
              <DoneProjectRow key={project.id} project={project} />
            ))}
          </ul>
        </>
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
