import { MOCK_TODAY_LABEL } from "@/lib/mock/projects";

export default function RecordFormTitle({ id, children }) {
  return (
    <div className="pb-4">
      <div className="flex items-center justify-between border-b border-ink pb-3">
        <h2 id={id} className="text-[18px] tracking-[-0.18px] text-ink">{children}</h2>
        <p className="text-label leading-[19.5px] text-ink-subtle">오늘 · {MOCK_TODAY_LABEL}</p>
      </div>
    </div>
  );
}
