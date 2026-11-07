import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TextLink from "@/components/ui/TextLink";

// 질문 끝(R-17, 04-a). 질문마다 '고치기'로 그 질문으로 돌아가 답을 고칠 수 있다.
export default function AiQuestionsComplete({ questions, responses, onEdit, reviewHref }) {
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
          <p className="text-label leading-[19.5px] text-ink-subtle">
            답을 바꾸고 싶으면 아래 질문에서 “고치기”를 눌러요.
          </p>
          <div className="flex justify-end">
            <Button variant="accent" href={reviewHref}>초안 확인하기 →</Button>
          </div>
        </div>
      </Card>
      <ol aria-label="질문과 답변 목록" className="flex flex-col gap-2">
        {questions.map((question, index) => (
          <li key={question.id} className="flex flex-col gap-1 rounded-2xl bg-white px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-label leading-[1.5] text-ink-subtle">질문 {index + 1} · {question.category}</p>
              <TextLink size="sm" aria-label={`질문 ${index + 1} 답 고치기`} onClick={() => onEdit(index)}>
                고치기
              </TextLink>
            </div>
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
