import TextLink from "@/components/ui/TextLink";

// 답한(또는 건너뛴) 질문과 내 답 목록(R-17). 질문마다 '고치기'로 그 질문으로 돌아간다.
// 질문 끝 화면과 질문을 진행하는 중에 함께 쓴다.
export default function AnsweredQuestionList({ questions, label, onEdit }) {
  return (
    <ol aria-label={label} className="flex flex-col gap-2">
      {questions.map(({ questionId, seq, tag, content, status, answer }) => (
        <li key={questionId} className="flex flex-col gap-1 rounded-2xl bg-white px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-label leading-[1.5] text-ink-subtle">질문 {seq} · {tag}</p>
            <TextLink size="sm" aria-label={`질문 ${seq} 답 고치기`} onClick={() => onEdit(questionId)}>
              고치기
            </TextLink>
          </div>
          <h3 className="text-body-sm">{content}</h3>
          <p className="whitespace-pre-wrap break-words text-body-sm text-ink-muted">
            {status === "SKIPPED" ? "건너뛴 질문이에요." : answer}
          </p>
        </li>
      ))}
    </ol>
  );
}
