import TextLink from "@/components/ui/TextLink";

// 답한(또는 건너뛴) 질문과 내 답 목록(R-17). 질문마다 '고치기'로 그 질문으로 돌아간다.
// 질문 끝 화면과 질문을 진행하는 중에 함께 쓴다. 내 답은 사용자가 쓴 글이라 Pretendard(font-input)다.
// raised: 질문 끝 화면(Figma 04-a, 11/14)처럼 카드마다 2px 회색 테두리와 아래 그림자를 둔다(테두리는 Figma 그대로 직선).
export default function AnsweredQuestionList({ questions, label, onEdit, raised = false }) {
  return (
    <ol aria-label={label} className={`flex flex-col ${raised ? "gap-3.5" : "gap-2"}`}>
      {questions.map(({ questionId, seq, tag, content, status, answer }) => (
        <li
          key={questionId}
          className={`flex flex-col gap-1 rounded-2xl bg-white px-4 py-3 text-body-sm leading-[22.4px] ${
            raised ? "border-2 border-[#cfcbc2] shadow-[0_4px_0_#e4e1da,0_12px_24px_rgba(31,36,51,0.1)]" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-label leading-[19.5px] text-ink-subtle">질문 {seq} · {tag}</p>
            <TextLink size="sm" aria-label={`질문 ${seq} 답 고치기`} onClick={() => onEdit(questionId)}>
              고치기
            </TextLink>
          </div>
          <h3 className="font-bold text-ink-strong">{content}</h3>
          {status === "SKIPPED" ? (
            <p className="text-ink-muted">건너뜀</p>
          ) : (
            <p className="font-input whitespace-pre-wrap break-words text-ink-muted">{answer}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
