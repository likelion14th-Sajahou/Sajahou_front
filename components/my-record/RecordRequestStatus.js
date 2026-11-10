import Button from "@/components/ui/Button";

export default function RecordRequestStatus({ resource, children = "나의 사자록을 불러오는 중이에요." }) {
  return <div className="flex flex-col items-start gap-3 py-6" aria-busy={resource.loading}>
    <p role={resource.error ? "alert" : "status"} className="text-body-sm text-ink-muted">
      {resource.error ? "불러오지 못했어요. 잠시 후 다시 시도해 주세요." : children}
    </p>
    {resource.error && <Button size="sm" onClick={resource.refresh}>다시 시도</Button>}
  </div>;
}
