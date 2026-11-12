import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/layout/AuthProvider";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Toast, { useToast } from "@/components/ui/Toast";
import { copyText } from "@/lib/clipboard";
import { saveEditedAnswer } from "@/lib/matchingApi";
import { getStoryCards } from "@/lib/myRecordApi";
import { recordHref } from "@/lib/myRecordNavigation";
import { cardView } from "@/lib/projectViewModel";
import { getRequestErrorMessage } from "@/lib/requestErrorMessage";
import MatchingAnswerCard from "./MatchingAnswerCard";
import { SOURCE_MARKS, answerText, cardSourceLabel, countCharacters } from "./matchingAnswer";

// 저장된 매칭 결과(39번)를 불러왔으면 문항마다 editedAnswer(직접 고쳐 저장한 답)가 함께 온다.
// 39번에는 고친 답의 글자 수가 없어서 저장할 때와 같은 규칙(빈칸 제외)으로 센다. 이미 저장된 답이므로 null로 두지 않는다.
function savedEdits(questions) {
  return Object.fromEntries(questions.filter(({ editedAnswer }) => editedAnswer)
    .map(({ questionId, editedAnswer }) => [questionId, { text: editedAnswer, charCount: countCharacters(editedAnswer) }]));
}

// 내 카드 수에 따라 색을 나눈다: 2장 이상 초록, 1장 노랑, 없음 빨강(M-06).
function getCountTone(cardCount) {
  if (cardCount >= 2) return "green";
  return cardCount === 1 ? "yellow" : "red";
}

// 매칭 결과. posting은 공고 저장·역량 찾기(36번) 응답이나 불러온 매칭 결과(39번), drafts는 문항별 답 초안(37번) 상태다.
// 공고를 새로 찾으면 이 화면을 새로 그리므로, 직접 고친 답도 그 공고의 것만 남는다.
export default function MatchingResults({ posting, drafts, onRetry }) {
  const { authenticatedRequest } = useAuth();
  const headingRef = useRef(null);
  const { toast, showToast, hideToast } = useToast();
  // 직접 고친 답(M-11): { [questionId]: { text, charCount } }. charCount는 저장(38번) 응답의 글자 수이고, 저장 뒤 다시 고치면 null이다.
  const [edits, setEdits] = useState(() => savedEdits(posting.questions));
  // '이 답에 쓴 기록'의 카드 모양(M-12). 나의 사자록과 같은 카드 목록(21번)과 표시 규칙(cardView)을 쓴다.
  const [cardViews, setCardViews] = useState({});
  const companyLabel = posting.company ?? "지원";

  // 결과가 새로 나오면(공고마다 새로 그린다) 결과 제목으로 스크롤하고 포커스를 옮긴다.
  // 36번 응답을 기다린 뒤 그려지므로, 그려진 다음에 실행되는 effect에서 옮긴다.
  useEffect(() => {
    const heading = headingRef.current;
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getStoryCards({}, { signal: controller.signal, request: authenticatedRequest })
      .then(({ cards }) => setCardViews(Object.fromEntries(cards.map((card) => [String(card.cardId), cardView(card)]))))
      // 모양은 꾸밈이라 불러오지 못하면 모양 없이 보여 준다.
      .catch(() => {});
    return () => controller.abort();
  }, [authenticatedRequest]);

  async function copy(text, message) {
    showToast((await copyText(text)) ? message : "복사가 막혀 있어요. 직접 고치기를 눌러 내용을 선택한 뒤 복사해 주세요.");
  }

  // '다 고쳤어요'(M-11): 고친 답을 저장한다(38번). AI 초안과 같아지면 null을 보내 초안으로 되돌린다.
  // 성공하면 "", 실패하면 안내 문구를 돌려준다.
  async function saveEdit(questionId, answer) {
    const edit = edits[questionId];
    // 고치지 않았거나 이미 저장했으면 보내지 않는다.
    if (!edit || edit.charCount !== null) return "";
    if (!edit.text.trim()) return "답을 입력해 주세요.";
    const editedAnswer = edit.text === answerText(answer) ? null : edit.text;
    try {
      const saved = await saveEditedAnswer(questionId, editedAnswer, { request: authenticatedRequest });
      setEdits((previous) => {
        const next = { ...previous };
        if (saved.editedAnswer === null) delete next[questionId];
        else next[questionId] = { text: saved.editedAnswer, charCount: saved.charCount };
        return next;
      });
      return "";
    } catch (failure) {
      return failure.status === 401 ? "" : getRequestErrorMessage(failure, "고친 답을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  }

  // 전체 답 복사(M-14): 모든 문항의 답과 근거 카드 목록을 Markdown으로. 직접 고친 답은 고친 내용으로 복사한다.
  function questionMarkdown({ questionId, seq, content }) {
    const draft = drafts[questionId];
    const heading = `## ${seq}. ${content}`;
    if (draft?.status !== "done") return `${heading}\n\n(아직 초안이 없어요)`;
    const { answer } = draft;
    if (answer.noMatchingCard) return `${heading}\n\n(이 문항에 맞는 카드가 아직 없어요)`;
    const sources = [
      ...answer.cards.map((card) => `- ${SOURCE_MARKS[card.no]} ${card.title} · ${cardSourceLabel(card)}`),
      ...(answer.usesJobPosting ? [`- ${SOURCE_MARKS[3]} ${companyLabel} 공고 · 주요 업무·우대사항`] : []),
    ];
    return `${heading}\n\n${edits[questionId]?.text ?? answerText(answer)}\n\n**이 답에 쓴 기록**\n${sources.join("\n")}`;
  }

  function copyAll() {
    copy(`# ${companyLabel} 자소서 초안\n\n${posting.questions.map(questionMarkdown).join("\n\n")}`, "전체 답을 복사했어요.");
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
                  {/* N장 보기(M-07): 나의 사자록 스토리 카드에서 이 역량 카드만 보여 준다. '없음'은 누를 수 없다. */}
                  {cardCount > 0 ? (
                    <Link href={recordHref(new URLSearchParams(), { tab: "cards", competencyId })} className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" aria-label={`${name} 카드 ${cardCount}장 보기`}>
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
        {posting.questions.map((question) => (
          <MatchingAnswerCard
            key={question.questionId}
            question={question}
            draft={drafts[question.questionId]}
            edit={edits[question.questionId]}
            cardViews={cardViews}
            companyLabel={companyLabel}
            onEdit={(text) => { setEdits((previous) => ({ ...previous, [question.questionId]: { text, charCount: null } })); hideToast(); }}
            onSaveEdit={(answer) => saveEdit(question.questionId, answer)}
            onRetry={() => onRetry(question.questionId)}
            onCopy={copy}
          />
        ))}
      </section>
      <Toast toast={toast} onDismiss={hideToast} />
    </div>
  );
}
