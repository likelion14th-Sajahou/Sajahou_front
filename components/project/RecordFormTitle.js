import { MOCK_TODAY_LABEL } from "@/lib/mock/projects";
import CardTitle from "@/components/ui/CardTitle";

export default function RecordFormTitle({ id, children }) {
  return (
    <div className="pb-4">
      <CardTitle
        id={id}
        action={<p className="text-label leading-[19.5px] text-ink-subtle">오늘 · {MOCK_TODAY_LABEL}</p>}
      >
        {children}
      </CardTitle>
    </div>
  );
}
