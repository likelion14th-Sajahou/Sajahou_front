const LEGEND_ITEMS = [
  { label: "회고 완료", swatch: "size-3 rounded-full bg-shape-green" },
  { label: "이번 주", swatch: "size-3 rounded-full bg-accent" },
  { label: "예정", swatch: "size-3 rounded-full border border-dashed border-[#8c8273]" },
  { label: "기록 없음", swatch: "m-[2.4px] size-[7.2px] rounded-full bg-[#c9c5bb]" },
  { label: "프로젝트 기간", swatch: "h-3 w-5 rounded-full border border-ink bg-shape-yellow" },
];

export default function FootprintLegend() {
  return (
    <ul className="flex flex-wrap gap-x-[18px] gap-y-1">
      {LEGEND_ITEMS.map(({ label, swatch }) => (
        <li key={label} className="flex items-center gap-1.5 text-label text-ink-muted">
          <span aria-hidden="true" className={swatch} />
          {label}
        </li>
      ))}
    </ul>
  );
}
