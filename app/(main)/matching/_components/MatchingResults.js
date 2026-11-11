import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { copyText } from "@/lib/clipboard";
import MatchingAnswerCard from "./MatchingAnswerCard";
import { answerText } from "./matchingAnswer";

// 내 카드 수에 따라 색을 나눈다: 2장 이상 초록, 1장 노랑, 없음 빨강(M-06).
function getCountTone(cardCount) {
  if (cardCount >= 2) return "green";
  return cardCount === 1 ? "yellow" : "red";
}

// 매칭 결과. posting은 공고 저장·역량 찾기(36번) 응답, drafts는 문항별 답 초안(37번) 상태다.
// 직접 고친 답은 이 화면에만 둔다. 공고를 새로 찾으면 이 화면을 새로 그려 비운다.
export default function MatchingResults({ posting, drafts, onRetry }) {
  const headingRef = useRef(null);
  const [notice, setNotice] = useState("");
  const [editedTexts, setEditedTexts] = useState({});
  const companyLabel = posting.company ?? "지원";

  // 결과가 새로 나오면(공고마다 새로 그린다) 결과 제목으로 스크롤하고 포커스를 옮긴다.
  // 36번 응답을 기다린 뒤 그려지므로, 그려진 다음에 실행되는 effect에서 옮긴다.
  useEffect(() => {
    const heading = headingRef.current;
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }, []);

  async function copy(text, message) {
    setNotice((await copyText(text)) ? message : "복사가 막혀 있어요. 직접 고치기를 눌러 내용을 선택한 뒤 복사해 주세요.");
  }

  function questionText({ questionId }) {
    const draft = drafts[questionId];
    if (editedTexts[questionId] !== undefined) return editedTexts[questionId];
    if (draft?.status !== "done") return "(아직 초안이 없어요)";
    return draft.answer.noMatchingCard ? "(이 문항에 맞는 카드가 아직 없어요)" : answerText(draft.answer);
  }

  function copyAll() {
    const text = posting.questions.map((question) => `## ${question.seq}. ${question.content}\n\n${questionText(question)}`).join("\n\n");
    copy(`# ${companyLabel} 자소서 초안\n\n${text}`, "전체 답을 복사했어요.");
  }

  return (
    <div className="pt-10">
      <section aria-labelledby="matching-competencies">
        <div className="mb-4 flex items-baseline gap-3">
          <h2 id="matching-competencies" ref={headingRef} tabIndex={-1} className="scroll-mt-6 text-[24px] tracking-[-0.48px] outline-none">공고가 원하는 역량</h2>
          <p className="text-label text-ink-subtle">공고·우대사항·인재상에서 찾았어요</p>
        </div>
        {/* 공고에서 역량을 하나도 찾지 못하면 공고 내용을 더 넣도록 안내한다(M-06). */}
        {posting.noCompetencyFound || !posting.competencies.length ? (
          <p className="text-body-sm text-ink-subtle">주요 업무나 우대사항을 조금 더 넣어 주세요</p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-10">
            {/* 카드 수는 서버가 고정 역량 목록(C-06)으로 센 값이라 나의 사자록의 역량 필터 결과와 같다. */}
            {posting.competencies.map(({ competencyId, name, evidenceQuote, cardCount }) => (
              <li key={competencyId} className="border-b border-line px-0.5 py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[16px]">#{name}</h3>
                  {cardCount > 0 ? (
                    <Link href={`/my-record?tag=${encodeURIComponent(name)}`} className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" aria-label={`${name} 카드 ${cardCount}장 보기`}>
                      <Badge tone={getCountTone(cardCount)} size="count">{cardCount}장 보기 →</Badge>
                    </Link>
                  ) : <Badge tone={getCountTone(cardCount)} size="count">없음</Badge>}
                </div>
                <p className="mt-1 text-body-sm text-ink-subtle">“{evidenceQuote}”</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="matching-answers" className="mt-24 flex flex-col gap-7 border-t-2 border-dashed border-[#d9d4ca] pt-12">
        <div className="flex items-center justify-between gap-4">
          <h2 id="matching-answers" className="text-[24px] tracking-[-0.48px]">문항별로 쓸 경험</h2>
          <Button size="sm" onClick={copyAll}>전체 답 복사</Button>
        </div>
        <p role="status" className="sr-only">{notice}</p>
        {posting.questions.map((question) => (
          <MatchingAnswerCard
            key={question.questionId}
            question={question}
            draft={drafts[question.questionId]}
            editedText={editedTexts[question.questionId]}
            companyLabel={companyLabel}
            onEdit={(value) => { setEditedTexts((previous) => ({ ...previous, [question.questionId]: value })); setNotice(""); }}
            onRetry={() => onRetry(question.questionId)}
            onCopy={copy}
          />
        ))}
      </section>
    </div>
  );
}
