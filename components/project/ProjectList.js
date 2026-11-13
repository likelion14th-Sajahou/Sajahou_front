"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMockData } from "@/components/layout/MockDataProvider";
import Button from "@/components/ui/Button";
import DrawnBorder from "@/components/ui/DrawnBorder";
import Badge from "@/components/ui/Badge";
import Toast from "@/components/ui/Toast";
import NewProjectModal from "./NewProjectModal";
import { formatRoles } from "./projectRoles";
import RequireAuth from "@/components/layout/RequireAuth";
import { useAuth } from "@/components/layout/AuthProvider";
import { formatMonthDay } from "@/lib/formatDate";

const SECTIONS = [
  { status: "active", title: "진행 중", empty: "진행 중인 프로젝트가 없어요" },
  { status: "done", title: "완료", empty: "완료한 프로젝트가 없어요" },
];

// 기록이 없는 새 프로젝트는 마지막 날짜를 빼고 보여 준다.
function getSummary({ recordCount, lastRecordDate }) {
  const lastDate = formatMonthDay(lastRecordDate);

  return [`기록 ${recordCount}`, lastDate && `마지막 ${lastDate}`]
    .filter(Boolean)
    .join(" · ");
}

// 카드 전체가 기록 추가 폼이 열린 프로젝트 상세로 가는 링크다(H-24). 완료한 프로젝트는 스티커를 회색으로 보여 준다.
function ProjectListCard({ project }) {
  const { id, name, subtitle, status, roles, recordCount, startedAt, lastRecordDate } = project;
  const isActive = status === "active";

  return (
    <li className={isActive ? "lg:col-span-2" : ""}>
      <Link
        href={`/projects/${id}?record=new`}
        aria-label={`${name} 기록 추가`}
        className={`relative flex h-full min-w-0 items-center rounded-[24px] ${isActive ? "gap-5 bg-white px-[22px] py-6 lg:min-h-[178px]" : "gap-4 bg-divider px-[18px] py-5 lg:min-h-[116px]"}`}
      >
        <DrawnBorder variant="thick-outline" color={isActive ? "var(--color-ink-900)" : "var(--color-ink-300)"} />
        <Image src={`/images/stickers/${isActive ? "laurel" : "trophy"}.png`} width={isActive ? 80 : 56} height={isActive ? 80 : 56} alt="" className={`shrink-0 ${isActive ? "size-14 sm:size-20" : "size-14 opacity-65"}`} />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className={`${isActive ? "text-heading leading-[30px]" : "text-[18px] leading-[26px]"} text-ink-strong`}>{name}</span>
          {subtitle && <span className="text-body-sm leading-5 text-ink-600">{subtitle}</span>}
          <span className="flex flex-wrap items-center gap-1.5 text-label leading-5 text-ink-500">
            <Badge tone={isActive ? "yellow" : "neutral"} className={isActive ? "py-px!" : "bg-white! py-px!"}>{formatRoles(roles)}</Badge>
            {isActive ? `기록 ${recordCount}개${startedAt ? ` · 시작 ${formatMonthDay(startedAt)}` : ""}` : getSummary(project)}
          </span>
          {isActive && <span className="flex flex-wrap items-center gap-3 pt-2">
            <span className="min-w-0 basis-full rounded-xl bg-canvas px-3 py-2 text-body-sm leading-[22px] text-ink-900 sm:flex-1 sm:basis-0">{lastRecordDate ? `마지막 기록 ${formatMonthDay(lastRecordDate)}` : "아직 남긴 기록이 없어요"} · 기록 {recordCount}개</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-[18px] py-[11px] text-body-sm leading-[22px] text-ink-900"><Image src="/images/project/plus-14.svg" width={14} height={14} alt="" />오늘 한 일 남기기</span>
          </span>}
        </span>
        {!isActive && <Image src="/images/project/add-record.png" width={40} height={40} alt="" className="shrink-0" />}
      </Link>
    </li>
  );
}

// 프로젝트 목록(H-23, 15). 상단 메뉴 '프로젝트'로 들어온다.
export default function ProjectList() {
  const { isAuthenticated } = useAuth();
  const { projects, projectData, flashToast, hideFlashToast } = useMockData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 font-display">
        <h1 className="text-[32px] leading-[46px] tracking-[-0.64px] text-ink-strong">
          프로젝트
        </h1>
        {isAuthenticated && projectData.status !== "ready" && <Button onClick={() => setIsModalOpen(true)}>+ 새 프로젝트</Button>}
      </div>
      <RequireAuth>
        {projectData.status === "loading" && <p role="status">프로젝트를 불러오고 있어요…</p>}
        {projectData.status === "error" && <div role="alert">{projectData.error} <Button onClick={() => projectData.refresh().catch(() => {})}>다시 시도</Button></div>}
        {projectData.status === "ready" && SECTIONS.map(({ status, title, empty }, index) => {
          const sectionProjects = projects.filter((project) => project.status === status);

          return (
            <section key={status} aria-label={title} className={`font-display ${index === 0 ? "pt-7" : "pt-10"}`}>
              <h2 className="text-title leading-8 tracking-[-0.4px] text-ink-strong">
                {title} <span className="text-yellow-700">{sectionProjects.length}</span>
              </h2>
              <ul className="grid grid-cols-1 gap-4 pt-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  {sectionProjects.map((project) => (
                    <ProjectListCard key={project.id} project={project} />
                  ))}
                  {status === "active" && isAuthenticated && <li><button type="button" onClick={() => setIsModalOpen(true)} className="relative flex min-h-[178px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[24px] p-5 text-ink-900">
                    <DrawnBorder variant="thin-outline" color="var(--color-ink-300)" />
                    <span className="flex size-11 items-center justify-center rounded-full border-2 border-ink-300"><Image src="/images/project/plus-20.svg" width={20} height={20} alt="" /></span>
                    <span className="text-[16px] leading-[25.6px]">새 프로젝트</span>
                  </button></li>}
              </ul>
              {sectionProjects.length === 0 && <p className="pt-3 text-body-sm text-ink-subtle">{empty}</p>}
            </section>
          );
        })}
        <NewProjectModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
        {/* 프로젝트를 지우고 넘어오면 안내한다(H-25). */}
        <Toast toast={flashToast} onDismiss={hideFlashToast} />
      </RequireAuth>
    </>
  );
}
