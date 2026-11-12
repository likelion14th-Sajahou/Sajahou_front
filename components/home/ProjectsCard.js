"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Card from "@/components/ui/Card";
import DrawnBorder from "@/components/ui/DrawnBorder";
import NewProjectModal from "@/components/project/NewProjectModal";
import SectionHeader from "./SectionHeader";

// 프로젝트 한 줄(Figma '프로젝트 목록 아이템'): 별 아이콘, 이름, 요약, 오른쪽 '>'. 줄 전체를 누르면 프로젝트 상세로 간다.
// 진행 중과 완료 프로젝트가 같은 모양이다(H-08).
// 디자인 적용(11/12)으로 오른쪽 '+'(기록 추가, H-09)를 '>'(프로젝트로 이동)로 바꿨다. 기록 추가는 상세 화면에서 한다.
function ProjectRow({ project, summary }) {
  const { id, name } = project;

  return (
    <li>
      <Link
        href={`/projects/${encodeURIComponent(id)}`}
        className="relative flex h-16 items-center gap-3 rounded-2xl bg-white px-4 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <DrawnBorder variant="project-row" />
        <Image src="/images/stars/star-01.png" alt="" width={27} height={26} className="shrink-0" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body leading-6 font-bold text-ink">{name}</span>
          <span className="truncate text-[12.5px] leading-5 text-ink-subtle">{summary}</span>
        </span>
        <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full">
          <Image src="/images/common/chevron-right-20.svg" alt="" width={20} height={20} />
        </span>
      </Link>
    </li>
  );
}

// 목록 구분 라벨(Figma '그룹 라벨'): 이름 + 오른쪽으로 이어지는 가는 선
function GroupLabel({ children }) {
  return (
    <p className="flex w-full items-center gap-2 text-body-sm leading-5 font-bold text-ink-500">
      {children}
      <span aria-hidden="true" className="h-px flex-1 bg-ink-300" />
    </p>
  );
}

export default function ProjectsCard({ inProgressProjects, doneProjects }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Card as="section" className="relative flex min-w-0 flex-col items-start gap-4 bg-divider! p-6!">
      <DrawnBorder variant="projects-card" />
      <SectionHeader title="프로젝트" href="/projects" chevronSize={32} />
      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full flex-col gap-2.5">
          {inProgressProjects.length > 0 ? (
            <ul className="flex w-full flex-col gap-2">
              {inProgressProjects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  // 기록이 없는 새 프로젝트는 마지막 기록 날짜를 빼고 보여 준다.
                  summary={[`기록 ${project.recordCount}`, project.lastRecordDate && `마지막 기록 ${project.lastRecordDate}`].filter(Boolean).join(" · ")}
                />
              ))}
            </ul>
          ) : (
            <p className="text-body-sm text-ink-subtle">진행 중인 프로젝트가 없어요</p>
          )}
          {/* 새 프로젝트 버튼(Figma '새 프로젝트 버튼') */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="relative flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-yellow-100 px-4 font-display text-body leading-[22px] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <DrawnBorder variant="new-project-button" />
            <Image src="/images/common/plus.svg" alt="" width={10} height={10} />
            새 프로젝트
          </button>
        </div>
        {doneProjects.length > 0 && (
          <div className="flex w-full flex-col gap-2">
            <GroupLabel>완료된 프로젝트</GroupLabel>
            <ul className="flex w-full flex-col gap-2">
              {doneProjects.map((project) => (
                <ProjectRow key={project.id} project={project} summary={`기록 ${project.recordCount}`} />
              ))}
            </ul>
          </div>
        )}
      </div>
      {isModalOpen && <NewProjectModal open onClose={() => setIsModalOpen(false)}
        onCreated={({ projectId }) => router.push(`/projects/${encodeURIComponent(projectId)}`)} />}
    </Card>
  );
}
