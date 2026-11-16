import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

// 회고 단계 화면의 '불러오는 중' 카드다. 실패하면 안내 문구와 '다시 시도'를 보여 준다(useStepData의 error·retry).
// children: 불러오는 중 문구.
export default function StepLoadCard({ error, onRetry, children }) {
  return (
    <Card as="section" size="md" className="flex flex-wrap items-center gap-3">
      {error ? (
        <>
          <p role="alert" className="text-body-sm text-error">{error}</p>
          <Button size="sm" variant="secondary" onClick={onRetry}>다시 시도</Button>
        </>
      ) : (
        <p role="status" className="text-body-sm text-ink-muted">{children}</p>
      )}
    </Card>
  );
}
