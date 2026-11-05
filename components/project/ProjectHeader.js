import Link from "next/link";

const STATUS_LABELS = {
  active: "진행 중",
  done: "완료",
};

export default function ProjectHeader({ project, recordCount, lastRecordedAt }) {
  const { name, subtitle, status, role, startedAt } = project;
  const stats = [
    { label: "기록", value: recordCount },
    { label: "시작", value: startedAt },
    { label: "마지막 기록", value: lastRecordedAt ?? "-" },
  ];

  return (
    <header className="flex items-end gap-6">
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
        <Link href="/" className="text-body-sm text-ink-muted">
          ← 홈
        </Link>
        <p className="text-label text-accent-strong">
          {STATUS_LABELS[status]} · {role}
        </p>
        <h1 className="text-[38px] leading-[1.2] tracking-[-0.76px] text-ink">
          {name} <span className="text-[22.8px] text-ink-subtle">{subtitle}</span>
        </h1>
      </div>
      <dl className="flex shrink-0 gap-6">
        {stats.map(({ label, value }) => (
          <div key={label} className="flex flex-col-reverse">
            <dd className="text-[26px] leading-[1.2] text-ink">{value}</dd>
            <dt className="text-caption text-ink-subtle">{label}</dt>
          </div>
        ))}
      </dl>
    </header>
  );
}
