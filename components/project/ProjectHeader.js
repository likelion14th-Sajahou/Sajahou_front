import Link from "next/link";
import { formatRoles } from "./projectRoles";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import DrawnBorder from "@/components/ui/DrawnBorder";
import { projectDateLabel } from "./projectDateLabel";

const STATUS_LABELS = {
  active: "진행 중",
  done: "완료",
};

export default function ProjectHeader({ project, recordCount, lastRecordedAt, portfolio = false }) {
  const { name, subtitle, status, roles, startedAt } = project;
  const stats = [
    { label: "기록", value: recordCount },
    { label: "시작", value: startedAt },
    { label: "마지막 기록", value: lastRecordedAt ?? "-" },
  ];

  // 포트폴리오 흐름에서만 새 시안을 적용해 기록 화면의 기존 헤더를 유지한다.
  if (portfolio) return (
    <header className="flex flex-col items-start gap-6 pt-4 font-display lg:flex-row lg:items-end">
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
        <Link href="/projects" className="text-body-sm text-ink-muted">← 프로젝트</Link>
        <div className="flex min-w-0 items-center gap-3.5 pt-1.5">
          <Image src="/images/stickers/laurel.png" width={64} height={64} alt="" className="shrink-0" />
          <div className="min-w-0">
            <div className="flex flex-wrap gap-1.5"><Badge tone="brand" className="py-0.5!">{STATUS_LABELS[status]}</Badge><Badge tone="yellow" className="py-0.5!">{formatRoles(roles)}</Badge></div>
            <h1 className="pt-0.5 text-[32px] leading-[46px] tracking-[-0.64px] text-ink-strong">
              {name} <span className="text-[18px] tracking-[-0.18px] text-ink-600">{subtitle}</span>
            </h1>
          </div>
        </div>
      </div>
      <dl className="relative flex max-w-full flex-wrap gap-7 rounded-[20px] bg-white px-6 py-3.5 lg:shrink-0">
        <DrawnBorder variant="thin-outline" color="var(--color-yellow-400)" />
        {stats.map(({ label, value }) => <div key={label} className="flex flex-col"><dt className="text-caption leading-[19.2px] text-ink-500">{label}</dt><dd className="text-[26px] leading-[31.2px] text-ink-strong">{label === "기록" ? value : projectDateLabel(value)}</dd></div>)}
      </dl>
    </header>
  );

  return (
    <header className="flex flex-col items-start gap-6 lg:flex-row lg:items-end">
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
        {/* 프로젝트는 홈 타일이나 상단 메뉴 '프로젝트'로 들어오므로 목록으로 돌아간다(H-11, H-24). */}
        <Link href="/projects" className="text-body-sm text-ink-muted">
          ← 프로젝트
        </Link>
        <p className="text-label text-accent-strong">
          {STATUS_LABELS[status]} · {formatRoles(roles)}
        </p>
        <h1 className="break-words text-[38px] leading-[1.2] tracking-[-0.76px] text-ink">
          {name} <span className="text-[22.8px] text-ink-subtle">{subtitle}</span>
        </h1>
      </div>
      <dl className="flex flex-wrap gap-4 lg:shrink-0 lg:gap-6">
        {stats.map(({ label, value }) => (
          <div key={label} className="flex flex-col-reverse">
            <dd className="text-[20px] leading-[1.2] text-ink lg:text-[26px]">{value}</dd>
            <dt className="text-caption text-ink-subtle">{label}</dt>
          </div>
        ))}
      </dl>
    </header>
  );
}
