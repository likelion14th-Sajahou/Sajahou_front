"use client";

import { useState } from "react";
import Link from "next/link";
import { useMockData } from "@/components/layout/MockDataProvider";
import Card from "@/components/ui/Card";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import TextLink from "@/components/ui/TextLink";
import NewProjectModal from "@/components/project/NewProjectModal";
import SectionHeader from "./SectionHeader";

// 진행 중과 완료 프로젝트가 같은 모양이고, 완료 프로젝트는 스티커를 회색으로 보여 준다(H-08, 01 시안).
// 완료한 프로젝트도 + 로 기록을 더할 수 있다(H-09, H-21).
function ProjectRow({ project, summary }) {
  const { id, name, status, shape, color } = project;

  return (
    <li className="flex items-center gap-3 rounded-2xl bg-canvas px-3 py-2.5">
      <ShapeCharacter shape={shape} color={status === "done" ? "muted" : color} size={34} />
      <Link href={`/projects/${id}`} className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-body text-ink">{name}</span>
        <span className="text-[12.5px] text-ink-subtle">{summary}</span>
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

export default function ProjectsCard() {
  const { projects } = useMockData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const activeProjects = projects.filter(({ status }) => status === "active");
  const doneProjects = projects.filter(({ status }) => status === "done");

  return (
    <Card as="section" className="flex flex-col items-start gap-3.5">
      <SectionHeader title="프로젝트" />
      {activeProjects.length > 0 ? (
        <ul className="flex w-full flex-col gap-2">
          {activeProjects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              // 기록이 없는 새 프로젝트는 마지막 기록 날짜를 빼고 보여 준다.
              summary={[`기록 ${project.records.length}`, project.records[0]?.date].filter(Boolean).join(" · ")}
            />
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
              <ProjectRow
                key={project.id}
                project={project}
                summary={`기록 ${project.records.length}`}
              />
            ))}
          </ul>
        </>
      )}
      <TextLink onClick={() => setIsModalOpen(true)}>+ 새 프로젝트</TextLink>
      <NewProjectModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Card>
  );
}
