"use client";

import { useState } from "react";
import Link from "next/link";
import { useMockData } from "@/components/layout/MockDataProvider";
import Button from "@/components/ui/Button";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import NewProjectModal from "./NewProjectModal";
import { formatRoles } from "./projectRoles";

const SECTIONS = [
  { status: "active", title: "진행 중", empty: "진행 중인 프로젝트가 없어요" },
  { status: "done", title: "완료", empty: "완료한 프로젝트가 없어요" },
];

// 기록이 없는 새 프로젝트는 마지막 날짜를 빼고 보여 준다.
function getSummary({ roles, records }) {
  const lastDate = records[0]?.date;

  return [formatRoles(roles), `기록 ${records.length}`, lastDate && `마지막 ${lastDate}`]
    .filter(Boolean)
    .join(" · ");
}

// 카드 전체가 기록 추가 폼이 열린 프로젝트 상세로 가는 링크다(H-24). 완료한 프로젝트는 스티커를 회색으로 보여 준다.
function ProjectListCard({ project }) {
  const { id, name, subtitle, status, shape, color } = project;

  return (
    <li>
      <Link
        href={`/projects/${id}?record=new`}
        aria-label={`${name} 기록 추가`}
        className="flex h-full items-center gap-3.5 rounded-[20px] bg-white px-5 py-[18px]"
      >
        <ShapeCharacter shape={shape} color={status === "done" ? "muted" : color} size={40} />
        <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <span className="truncate text-[17px] leading-[27.2px] text-ink">{name}</span>
          {subtitle && <span className="truncate text-[15px] leading-6 text-ink-subtle">{subtitle}</span>}
          <span className="text-label leading-[19.5px] text-ink-subtle">{getSummary(project)}</span>
        </span>
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-[20px] text-white"
        >
          +
        </span>
      </Link>
    </li>
  );
}

// 프로젝트 목록(H-23, 15). 상단 메뉴 '프로젝트'로 들어온다.
export default function ProjectList() {
  const { projects } = useMockData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-end justify-between gap-6">
        <h1 className="text-[38px] leading-[1.2] tracking-[-0.76px] text-ink">
          프로젝트<span className="text-accent">.</span>
        </h1>
        <Button onClick={() => setIsModalOpen(true)}>+ 새 프로젝트</Button>
      </div>
      {SECTIONS.map(({ status, title, empty }, index) => {
        const sectionProjects = projects.filter((project) => project.status === status);

        return (
          <section key={status} aria-label={title} className={index === 0 ? "pt-6" : "pt-8"}>
            <h2 className="text-[18px] leading-[28.8px] tracking-[-0.36px] text-ink">
              {title} <span className="text-ink-subtle">{sectionProjects.length}</span>
            </h2>
            {sectionProjects.length > 0 ? (
              <ul className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-2 lg:grid-cols-3">
                {sectionProjects.map((project) => (
                  <ProjectListCard key={project.id} project={project} />
                ))}
              </ul>
            ) : (
              <p className="pt-3 text-body-sm text-ink-subtle">{empty}</p>
            )}
          </section>
        );
      })}
      <NewProjectModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
