import Link from "next/link";
import { Fragment, useRef, useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TextLink from "@/components/ui/TextLink";
import { draftText } from "@/lib/mock/matchingResult";

const SOURCE_MARKS = ["", "①", "②", "③"];
const ICON_CLASSES = {
  team: "left-[8%] top-[8%]",
  interview: "left-[4%] top-[4%]",
  problem: "left-[6%] top-[8%]",
  research: "left-[6%] top-[34%]",
  layout: "left-[8%] top-[8%]",
  retrospective: "left-[4%] top-[4%]",
};

function RecordIcon({ icon }) {
  return (
    <span aria-hidden="true" className="relative size-[18px] shrink-0 overflow-hidden">
      {/* Figma 원본 SVG의 고유 크기와 슬롯 내 여백을 유지한다. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/images/matching/${icon}.svg`} alt="" className={`absolute max-w-none ${ICON_CLASSES[icon]}`} />
    </span>
  );
}

export default function MatchingAnswerCard({ answer, index, company, onEdit, onCopy }) {
  const [editing, setEditing] = useState(false);
  const editButtonRef = useRef(null);
  const text = answer.editedText ?? draftText(answer.parts);
  const gapCount = (text.match(/\[[^\]]*\]/g) || []).length;
  const characterCount = text.replace(/\[[^\]]*\]/g, "").length;

  return (
    <Card as="article" size="md" className="flex flex-col gap-4 py-7" aria-labelledby={`answer-heading-${answer.id}`}>
      <div className="flex items-start gap-3">
        <Badge tone="dark" size="question" className="mt-0.5">Q{index + 1}</Badge>
        <h3 id={`answer-heading-${answer.id}`} className="text-[18px] leading-[1.5]">{answer.question}</h3>
      </div>
      {answer.parts.length ? (
        <>
          {editing ? (
            <textarea rows={9} aria-label={`문항 ${index + 1} 초안`} value={text} onChange={(event) => onEdit(answer.id, event.target.value)} autoFocus className="h-[297px] w-full resize-none rounded-2xl border border-transparent bg-draft px-5 py-[18px] text-[16px] leading-[1.8] focus-visible:outline-2 focus-visible:outline-ink" />
          ) : (
            <div className="rounded-2xl bg-draft px-[22px] py-5 text-[16px] leading-[1.95] whitespace-pre-wrap break-words">
              {answer.editedText !== null ? text : answer.parts.map((part, partIndex) => (
                <Fragment key={partIndex}>
                  {partIndex > 0 && " "}
                  {part.gap ? (
                    // 카드에 없는 내용은 지어내지 않고 주황 점선 빈칸으로 남긴다(M-10). 줄이 바뀌면 테두리를 닫지 않고 이어 그린다.
                    <span className="rounded-md border-[1.5px] border-dashed border-[#ff9a66] bg-[#ffe6d9] px-1.5 py-px text-[14px] font-bold text-[#b03a00]">
                      {part.text}
                    </span>
                  ) : (
                    <>
                      {part.text}
                      {/* 출처 표시(M-09): ① 추천 카드, ② 보조 카드, ③ 지원 공고 */}
                      {part.source && (
                        <sup className="ml-px text-[10px] font-extrabold text-accent-strong">{SOURCE_MARKS[part.source]}</sup>
                      )}
                    </>
                  )}
                </Fragment>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between gap-2.5">
            <span className="text-label text-ink-subtle tabular-nums">{characterCount}자</span>
            <div className="flex items-center gap-3">
              <TextLink ref={editButtonRef} aria-expanded={editing} onClick={() => {
                setEditing(!editing);
                if (editing) requestAnimationFrame(() => editButtonRef.current?.focus());
              }}>{editing ? "다 고쳤어요" : "직접 고치기"}</TextLink>
              <Button size="sm" aria-label={`문항 ${index + 1} 답 복사`} onClick={() => onCopy(text, `Q${index + 1} 답을 복사했어요.`)}>이 답 복사</Button>
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-label text-ink-subtle">이 답에 쓴 기록</p>
            <ul className="flex flex-col gap-0.5">
              {answer.records.map((record, recordIndex) => (
                <li key={record.id}>
                  <Link href={`/my-record?tab=cards&highlight=${record.id}`} className="flex w-full items-center gap-2 rounded-[10px] px-2 py-[7px] text-left">
                    <span className="w-4 text-label text-accent-strong">{SOURCE_MARKS[recordIndex + 1]}</span>
                    <RecordIcon icon={record.icon} />
                    <span className="text-body-sm">{record.title}</span>
                    <span className="text-label text-ink-subtle">{record.when}</span>
                    <span className="ml-auto text-[12.5px] leading-5 text-accent-strong">보기 →</span>
                  </Link>
                </li>
              ))}
              <li className="flex items-center gap-2 px-2 py-[7px]">
                <span className="w-4 text-label text-accent-strong">③</span>
                <span className="text-body-sm">{company} 공고</span>
                <span className="text-label text-ink-subtle">주요 업무·우대사항</span>
              </li>
            </ul>
          </div>
          {gapCount > 0 && <p className="rounded-xl bg-tint-yellow px-3 py-2.5 text-label text-tint-yellow-ink">⚑ 빈칸 {gapCount}곳은 사자록에 기록이 없어 비워 뒀어요. 지어내지 않았어요. 회고에서 이 부분까지 남기면 다음엔 바로 채워져요.</p>}
        </>
      ) : (
        // 문항에 맞는 카드가 없으면 초안을 만들지 않고 안내한다(M-08).
        <p className="text-body-sm text-ink-subtle">이 문항에 맞는 카드가 아직 없어요.</p>
      )}
    </Card>
  );
}
