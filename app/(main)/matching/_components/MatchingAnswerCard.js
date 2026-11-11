import Link from "next/link";
import { Fragment, useRef, useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TextLink from "@/components/ui/TextLink";
import { SOURCE_MARKS, answerText, cardSourceLabel, countBlanks, countCharacters } from "./matchingAnswer";

const NOTICE_CLASS = "rounded-xl bg-tint-yellow px-3 py-2.5 text-label text-tint-yellow-ink";

// 문항이 묻지만 사자록에 카드가 없는 역량(M-13)
function MissingCompetencies({ competencies }) {
  if (!competencies.length) return null;
  return <p className={NOTICE_CLASS}>⚑ {competencies.map(({ name }) => `#${name}`).join(" ")} 경험은 아직 사자록에 없어요.</p>;
}

// 초안 본문: 카드 문장 끝에 출처(①②③)를, 카드에 없는 내용은 주황 점선 빈칸으로 보여 준다(M-09, M-10).
function DraftSegments({ segments }) {
  return segments.map((segment, index) => (
    <Fragment key={index}>
      {index > 0 && " "}
      {segment.type === "blank" ? (
        // 줄이 바뀌면 테두리를 닫지 않고 이어 그린다.
        <span className="rounded-md border-[1.5px] border-dashed border-[#ff9a66] bg-[#ffe6d9] px-1.5 py-px text-[14px] font-bold text-[#b03a00]">
          [{segment.hint}]
        </span>
      ) : (
        <>
          {segment.text}
          {segment.source && <sup className="ml-px text-[10px] font-extrabold text-accent-strong">{SOURCE_MARKS[segment.source]}</sup>}
        </>
      )}
    </Fragment>
  ));
}

// 만든 초안. 직접 고친 글(editedText)이 있으면 그 글로 보여 주고 세고 복사한다.
function AnswerDraft({ question, answer, editedText, companyLabel, onEdit, onCopy }) {
  const [editing, setEditing] = useState(false);
  const editButtonRef = useRef(null);
  const isEdited = editedText !== undefined;
  const text = isEdited ? editedText : answerText(answer);
  const characterCount = isEdited ? countCharacters(editedText) : answer.charCount;
  const blankCount = isEdited ? countBlanks(editedText) : answer.blankCount;

  return (
    <>
      {editing ? (
        <textarea rows={9} aria-label={`문항 ${question.seq} 초안`} value={text} onChange={(event) => onEdit(event.target.value)} autoFocus className="h-[297px] w-full resize-none rounded-2xl border border-transparent bg-draft px-5 py-[18px] text-[16px] leading-[1.8] focus-visible:outline-2 focus-visible:outline-ink" />
      ) : (
        <div className="rounded-2xl bg-draft px-[22px] py-5 text-[16px] leading-[1.95] whitespace-pre-wrap break-words">
          {isEdited ? text : <DraftSegments segments={answer.segments} />}
        </div>
      )}
      <div className="flex items-center justify-between gap-2.5">
        <span className="text-label text-ink-subtle tabular-nums">{characterCount}자</span>
        <div className="flex items-center gap-3">
          <TextLink ref={editButtonRef} aria-expanded={editing} onClick={() => {
            setEditing(!editing);
            if (editing) requestAnimationFrame(() => editButtonRef.current?.focus());
          }}>{editing ? "다 고쳤어요" : "직접 고치기"}</TextLink>
          <Button size="sm" aria-label={`문항 ${question.seq} 답 복사`} onClick={() => onCopy(text, `Q${question.seq} 답을 복사했어요.`)}>이 답 복사</Button>
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-label text-ink-subtle">이 답에 쓴 기록</p>
        <ul className="flex flex-col gap-0.5">
          {answer.cards.map((card) => (
            <li key={card.cardId}>
              <Link href={`/my-record?tab=cards&highlight=${encodeURIComponent(card.cardId)}`} className="flex w-full items-center gap-2 rounded-[10px] px-2 py-[7px] text-left">
                <span className="w-4 text-label text-accent-strong">{SOURCE_MARKS[card.no]}</span>
                <span className="text-body-sm">{card.title}</span>
                <span className="text-label text-ink-subtle">{cardSourceLabel(card)}</span>
                <span className="ml-auto text-[12.5px] leading-5 text-accent-strong">보기 →</span>
              </Link>
            </li>
          ))}
          {answer.usesJobPosting && (
            <li className="flex items-center gap-2 px-2 py-[7px]">
              <span className="w-4 text-label text-accent-strong">{SOURCE_MARKS[3]}</span>
              <span className="text-body-sm">{companyLabel} 공고</span>
              <span className="text-label text-ink-subtle">주요 업무·우대사항</span>
            </li>
          )}
        </ul>
      </div>
      {blankCount > 0 && <p className={NOTICE_CLASS}>⚑ 빈칸 {blankCount}곳은 사자록에 기록이 없어 비워 뒀어요. 지어내지 않았어요. 회고에서 이 부분까지 남기면 다음엔 바로 채워져요.</p>}
      <MissingCompetencies competencies={answer.missingCompetencies} />
    </>
  );
}

// 문항 하나의 답 카드. 초안(37번)을 만드는 중·실패·맞는 카드 없음·초안을 나눠 보여 준다.
export default function MatchingAnswerCard({ question, draft, editedText, companyLabel, onEdit, onRetry, onCopy }) {
  const headingId = `answer-heading-${question.questionId}`;
  let body;
  if (!draft || draft.status === "loading") {
    body = <p role="status" className="text-body-sm text-ink-muted">사자록 카드로 초안을 만드는 중이에요.</p>;
  } else if (draft.status === "error") {
    body = (
      <div className="flex flex-wrap items-center gap-3">
        <p role="alert" className="text-body-sm text-error">{draft.error}</p>
        <Button size="sm" variant="secondary" onClick={onRetry}>다시 만들기</Button>
      </div>
    );
  } else if (draft.answer.noMatchingCard) {
    // 문항에 맞는 카드가 없으면 초안을 만들지 않고 안내한다(M-08).
    body = (
      <>
        <p className="text-body-sm text-ink-subtle">이 문항에 맞는 카드가 아직 없어요.</p>
        <MissingCompetencies competencies={draft.answer.missingCompetencies} />
      </>
    );
  } else {
    body = <AnswerDraft question={question} answer={draft.answer} editedText={editedText} companyLabel={companyLabel} onEdit={onEdit} onCopy={onCopy} />;
  }

  return (
    <Card as="article" size="md" className="flex flex-col gap-4 py-7" aria-labelledby={headingId} aria-busy={!draft || draft.status === "loading"}>
      <div className="flex items-start gap-3">
        <Badge tone="dark" size="question" className="mt-0.5">Q{question.seq}</Badge>
        <h3 id={headingId} className="text-[18px] leading-[1.5]">{question.content}</h3>
      </div>
      {body}
    </Card>
  );
}
