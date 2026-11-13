import FootprintSticker, { CurrentWeekSticker } from "./FootprintSticker";

const LEGEND_ITEMS = [
  { label: "회고 완료", icon: <FootprintSticker week={0} size={16} /> },
  { label: "프로젝트 회고 완료", icon: <FootprintSticker week={13} isProjectRecap size={16} /> },
  { label: "이번 주", icon: <CurrentWeekSticker small /> },
  { label: "예정", swatch: "size-3 rounded-full border-[1.5px] border-dashed border-ink-300" },
  { label: "기록 없음", swatch: "size-2 rounded-full bg-line-strong" },
  { label: "프로젝트 기간", swatch: "h-2.5 w-5 rounded-full bg-shape-yellow" },
];

export default function FootprintLegend() {
  return (
    <ul className="flex flex-wrap gap-x-[18px] gap-y-1">
      {LEGEND_ITEMS.map(({ label, icon, swatch }) => (
        <li key={label} className="flex items-center gap-1.5 text-label text-ink">
          <span aria-hidden="true" className={swatch}>{icon}</span>
          {label}
        </li>
      ))}
    </ul>
  );
}
