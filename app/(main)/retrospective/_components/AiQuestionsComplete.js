import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import AnsweredQuestionList from "./AnsweredQuestionList";
import RetroDarkCard from "./RetroDarkCard";
import { useReviewDraftRequest } from "./useReviewDraftRequest";
import AiWaitingNotice from "@/components/ui/AiWaitingNotice";

// 질문 끝(R-17, 04-a). 질문마다 '고치기'로 그 질문으로 돌아가 답을 고칠 수 있다.
export default function AiQuestionsComplete({ questions, onEdit }) {
  const review = useReviewDraftRequest();

  return (
    <>
      <RetroDarkCard border="start-card" aria-labelledby="questions-complete-title">
        <div className="flex items-center justify-between">
          <Badge tone="brand">질문 끝</Badge>
          <p className="text-label font-bold text-locked">{questions.length} / {questions.length}</p>
        </div>
        <h2 id="questions-complete-title" className="font-display text-[24px] leading-[1.45] tracking-[-0.24px] text-white">
          답해 줘서 고마워요. 이제 회고록과 스토리 카드 초안을 만들어 볼게요.
        </h2>
        <p className="text-label leading-[19.5px] text-locked">
          답을 바꾸고 싶으면 아래 질문에서 “고치기”를 눌러요.
        </p>
        <div className="flex justify-end">
          <Button variant="cta" onClick={review.openReview} disabled={review.isCreating} aria-busy={review.isCreating}>
            {review.isCreating ? "초안을 만드는 중…" : "초안 확인하기 →"}
          </Button>
        </div>
        <AiWaitingNotice active={review.isCreating} doing="답을 바탕으로 회고록과 스토리 카드 초안을 만들고 있어요" className="text-locked!" />
        {review.error && <p role="alert" className="text-body-sm text-tint-red">{review.error}</p>}
      </RetroDarkCard>
      <AnsweredQuestionList questions={questions} label="질문과 답변 목록" onEdit={onEdit} />
    </>
  );
}
