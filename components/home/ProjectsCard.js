"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Card from "@/components/ui/Card";
import DrawnBorder from "@/components/ui/DrawnBorder";
import NewProjectModal from "@/components/project/NewProjectModal";
import { categoryName } from "@/lib/projectViewModel";
import { projectBadgeImage } from "@/lib/stickerBadges";
import { formatMonthDay } from "@/lib/formatDate";
import SectionHeader from "./SectionHeader";

// 프로젝트 한 줄(Figma '[디] 01-d' 홈 프로젝트 칸, 11/15): 종류 스티커, 종류 이름, 요약, 오른쪽 동그라미 버튼.
// 진행 중은 오른쪽 '+'로 바로 기록 추가(H-09), 완료는 '>'로 포트폴리오(상세)로 간다. 글자 부분을 누르면 프로젝트 상세로 간다.
// 종류(category, #82)가 없는 예전 데이터는 별 아이콘과 프로젝트 이름으로 보여 준다.
// 화면에는 Figma대로 종류만 보이고, 같은 종류가 여럿이어도 구분되도록 프로젝트 이름은 스크린리더에만 읽힌다.
function ProjectRow({ project, summary, done = false }) {
  const { id, name, category } = project;
  const label = categoryName(category);
  const sticker = projectBadgeImage(category);
  const projectHref = `/projects/${encodeURIComponent(id)}`;
  const title = label ?? name;

  return (
    <li className="relative flex h-16 items-center gap-3 rounded-2xl bg-white px-4 py-2">
      <DrawnBorder variant="thin-outline" />
      {sticker ? (
        <Image src={sticker} alt="" width={40} height={40} className="size-10 shrink-0 object-contain" />
      ) : (
        <Image src="/images/stars/star-01.png" alt="" width={27} height={26} className="shrink-0" />
      )}
      {/* 글자 링크가 줄 전체를 덮어서(after) 줄 어디를 눌러도 상세로 간다. 오른쪽 버튼만 그 위에 따로 둔다. */}
      <Link href={projectHref} className="flex min-w-0 flex-1 flex-col outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ink">
        <span className="truncate text-body leading-6 font-bold text-ink">
          {title}
          {label && <span className="sr-only"> {name}</span>}
        </span>
        <span className="font-display truncate text-[12.5px] leading-5 text-ink-subtle">{summary}</span>
      </Link>
      <Link
        href={done ? projectHref : `${projectHref}?record=new`}
        aria-label={`${title}${label ? ` ${name}` : ""} ${done ? "포트폴리오 보기" : "기록 추가"}`}
        className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        {done
          ? <Image src="/images/project/portfolio-link.svg" alt="" width={34} height={34} />
          : <Image src="/images/project/add-record.png" alt="" width={36} height={36} />}
      </Link>
    </li>
  );
}

// 목록 구분 라벨(Figma '그룹 라벨'): 이름 + 오른쪽으로 이어지는 가는 선
function GroupLabel({ children }) {
  return (
    <p className="flex w-full items-center gap-2 pt-1 font-display text-body-sm leading-5 text-ink-500">
      {children}
      <span aria-hidden="true" className="h-px flex-1 bg-ink-300" />
    </p>
  );
}

export default function ProjectsCard({ inProgressProjects, doneProjects }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalOpener = useRef(null);

  // 팝업은 닫으면 화면에서 지워져 브라우저가 포커스를 되돌리지 못한다. 사라진 뒤에 연 버튼으로 옮긴다.
  useEffect(() => {
    if (!isModalOpen) modalOpener.current?.focus();
  }, [isModalOpen]);

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
                  // Figma: '기록 2 · 11/1'. 기록이 없는 새 프로젝트는 날짜를 빼고 보여 준다.
                  summary={[`기록 ${project.recordCount}`, formatMonthDay(project.lastRecordDate)].filter(Boolean).join(" · ")}
                />
              ))}
            </ul>
          ) : (
            <>
              <p className="text-body-sm text-ink-subtle">진행 중인 프로젝트가 없어요</p>
              {/* 새 프로젝트 버튼(Figma '새 프로젝트 버튼'): 프로젝트 목록 화면처럼 진행 중인 프로젝트가 없을 때만 보여 준다. */}
              <button
                type="button"
                onClick={(event) => { modalOpener.current = event.currentTarget; setIsModalOpen(true); }}
                className="relative flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-yellow-100 px-4 font-display text-body leading-[22px] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <DrawnBorder variant="new-project-button" />
                <Image src="/images/common/plus.svg" alt="" width={10} height={10} />
                새 프로젝트
              </button>
            </>
          )}
        </div>
        {doneProjects.length > 0 && (
          <div className="flex w-full flex-col gap-2">
            <GroupLabel>완료</GroupLabel>
            <ul className="flex w-full flex-col gap-2">
              {doneProjects.map((project) => (
                <ProjectRow key={project.id} project={project} summary={`기록 ${project.recordCount}`} done />
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
