import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import AnsweredQuestionList from "./AnsweredQuestionList";

// 질문 끝(R-17, 04-a). 질문마다 '고치기'로 그 질문으로 돌아가 답을 고칠 수 있다.
export default function AiQuestionsComplete({ questions, onEdit, reviewHref }) {
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
      <AnsweredQuestionList questions={questions} label="질문과 답변 목록" onEdit={onEdit} />
    </>
  );
}
