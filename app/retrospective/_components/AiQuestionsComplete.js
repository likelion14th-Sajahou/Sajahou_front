import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TextLink from "@/components/ui/TextLink";

export default function AiQuestionsComplete({ questions, responses, onReturn }) {
  return (
    <>
      <Card as="section" size="md" className="rounded-[28px]" aria-labelledby="questions-complete-title">
        <div className="flex flex-col gap-4 p-1">
          <div className="flex items-center justify-between">
            <Badge tone="green">질문 끝</Badge>
            <p className="text-label text-ink-subtle">{questions.length} / {questions.length}</p>
          </div>
          <h2 id="questions-complete-title" className="text-[24px] leading-[1.45] tracking-[-0.01em]">
            답해 줘서 고마워요. 이제 회고록과 스토리 카드 초안을 만들어 볼게요.
          </h2>
          <div className="flex items-center justify-between gap-3">
            <TextLink onClick={onReturn}>← 마지막 질문 다시</TextLink>
            <Button variant="accent" href="/retrospective?step=review">초안 확인하기 →</Button>
          </div>
        </div>
      </Card>
      <ol aria-label="질문과 답변 목록" className="flex flex-col gap-2">
        {questions.map((question, index) => (
          <li key={question.id} className="flex flex-col gap-1 rounded-2xl bg-white px-4 py-3">
            <p className="text-label leading-[1.5] text-ink-subtle">질문 {index + 1} · {question.category}</p>
            <h3 className="text-body-sm">{question.question}</h3>
            <p className="whitespace-pre-wrap break-words text-body-sm text-ink-muted">
              {responses[question.id].status === "skipped" ? "건너뛴 질문이에요." : responses[question.id].answer}
            </p>
          </li>
        ))}
      </ol>
    </>
  );
}
