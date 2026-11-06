import { useState } from "react";
import Link from "next/link";
import { useMockData } from "@/components/layout/MockDataProvider";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { draftText } from "@/lib/mock/matchingResult";
import MatchingAnswerCard from "./MatchingAnswerCard";

export default function MatchingResults({ result, onEdit, headingRef }) {
  const { storyCards } = useMockData();
  const [notice, setNotice] = useState("");

  async function copy(text, message) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(message);
    } catch {
      setNotice("복사가 막혀 있어요. 직접 고치기를 눌러 내용을 선택한 뒤 복사해 주세요.");
    }
  }

  function copyAll() {
    const text = result.answers.map((answer, index) => `## ${index + 1}. ${answer.question}\n\n${answer.parts.length ? answer.editedText ?? draftText(answer.parts) : "(맞는 카드가 아직 없어요)"}`).join("\n\n");
    copy(`# ${result.company} 자소서 초안\n\n${text}`, "전체 답을 복사했어요.");
  }

  return (
    <div className="pt-10">
      <section aria-labelledby="matching-competencies">
        <div className="mb-4 flex items-baseline gap-3">
          <h2 id="matching-competencies" ref={headingRef} tabIndex={-1} className="scroll-mt-6 text-[24px] tracking-[-0.48px] outline-none">공고가 원하는 역량</h2>
          <p className="text-label text-ink-subtle">공고·우대사항·인재상에서 찾았어요</p>
        </div>
          <ul className="grid grid-cols-2 gap-x-10">
            {result.competencies.map((competency) => {
              // 눌러서 보는 나의 사자록의 역량 필터 결과와 같은 수를 보여 준다.
              const cardCount = storyCards.filter(({ tags }) => tags.includes(competency.name)).length;

              return (
              <li key={competency.name} className="border-b border-line px-0.5 py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[16px]">#{competency.name}</h3>
                  {cardCount > 0 ? (
                    <Link href={`/my-record?tag=${encodeURIComponent(competency.name)}`} className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" aria-label={`${competency.name} 카드 ${cardCount}장 보기`}>
                      <Badge tone="green" size="count">{cardCount}장 보기 →</Badge>
                    </Link>
                  ) : <Badge>없음</Badge>}
                </div>
                <p className="mt-1 text-body-sm text-ink-subtle">“{competency.quote}”</p>
              </li>
              );
            })}
          </ul>
      </section>
      <section aria-labelledby="matching-answers" className="mt-24 flex flex-col gap-7 border-t-2 border-dashed border-[#d9d4ca] pt-12">
        <div className="flex items-center justify-between gap-4">
          <h2 id="matching-answers" className="text-[24px] tracking-[-0.48px]">문항별로 쓸 경험</h2>
          <Button size="sm" onClick={copyAll}>전체 답 복사</Button>
        </div>
        <p role="status" className="sr-only">{notice}</p>
        {result.answers.map((answer, index) => (
          <MatchingAnswerCard key={answer.id} answer={answer} index={index} company={result.company} onEdit={(id, value) => { onEdit(id, value); setNotice(""); }} onCopy={copy} />
        ))}
      </section>
    </div>
  );
}
