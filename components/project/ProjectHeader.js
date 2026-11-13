import Image from "next/image";
import Link from "next/link";
import DrawnBorder from "@/components/ui/DrawnBorder";
import { formatMonthDay } from "@/lib/formatDate";
import { projectBadgeImageByName } from "@/lib/stickerBadges";
import { formatRoles } from "./projectRoles";

const STATUS = {
  active: { label: "진행 중", className: "bg-yellow-400 text-ink-950" },
  done: { label: "완료", className: "bg-[#e4e2dd] text-ink" },
};

// 프로젝트 상세 머리(11/13 디자인): 프로젝트 스티커, 상태·역할 배지, 이름과 부제목, 오른쪽 숫자 카드(노란 손그림 테두리).
export default function ProjectHeader({ project, recordCount, lastRecordedAt }) {
  const { name, subtitle, status, roles, startedAt } = project;
  const stats = [
    { label: "기록", value: recordCount },
    { label: "시작", value: formatMonthDay(startedAt) },
    { label: "마지막 기록", value: lastRecordedAt ? formatMonthDay(lastRecordedAt) : "-" },
  ];

  return (
    <header className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex min-w-0 flex-col items-start gap-1.5">
        {/* 프로젝트는 홈 타일이나 상단 메뉴 '프로젝트'로 들어오므로 목록으로 돌아간다(H-11, H-24). */}
        <Link href="/projects" className="font-display text-body-sm leading-[22.4px] text-ink-muted">
          ← 프로젝트
        </Link>
        <div className="flex min-w-0 items-center gap-3.5">
          <Image src={projectBadgeImageByName(name)} alt="" width={64} height={64} className="size-16 shrink-0 object-contain" />
          <div className="min-w-0">
            <p className="mb-0.5 flex gap-1.5 text-caption leading-[18px] font-bold">
              <span className={`rounded-full px-2.5 py-0.5 ${STATUS[status].className}`}>{STATUS[status].label}</span>
              <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-yellow-700">{formatRoles(roles)}</span>
            </p>
            <h1 className="font-display text-[32px] leading-[46px] tracking-[-0.64px] break-words text-ink-strong">
              {name} {subtitle && <span className="text-[18px] tracking-[-0.18px] text-ink-subtle">{subtitle}</span>}
            </h1>
          </div>
        </div>
      </div>
      <dl className="relative flex shrink-0 flex-wrap gap-x-7 gap-y-2 rounded-[20px] bg-white px-6 py-3.5">
        <DrawnBorder variant="start-card" color="var(--color-yellow-400)" />
        {stats.map(({ label, value }) => (
          <div key={label} className="flex flex-col-reverse">
            <dd className="font-display text-[26px] leading-[1.2] text-ink-strong">{value}</dd>
            <dt className="text-caption font-bold text-ink-500">{label}</dt>
          </div>
        ))}
      </dl>
    </header>
  );
}
