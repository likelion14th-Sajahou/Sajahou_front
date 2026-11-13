"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";
import Toast, { useToast } from "@/components/ui/Toast";
import CompetencyTags from "./CompetencyTags";
import StoryCardEditForm from "./StoryCardEditForm";
import { COPY_FAILED_MESSAGE, RECORD_TEXT, SUMMARY_FIELDS } from "./storyCardTypes";
import { StoryCardIcon, StoryCardTypeBadge } from "./StoryCardVisuals";
import { copyText } from "@/lib/clipboard";
import useProjectAction from "@/components/project/useProjectAction";

const RECAP_TEXT = {
  title: "회고록 전문",
  copied: "회고록을 복사했어요. 노션에 붙여 넣어 주세요.",
};

// 회고록 Markdown을 줄 단위로 읽어 시안의 글자 크기로 표시한다.
function DocumentLine({ line }) {
  const numbered = line.match(/^(\d+)\. (.*)$/);
  const heading = line.match(/^#{1,2} (.*)$/);

  if (line.startsWith("#### ")) {
    return <p className="pt-2 text-body-sm leading-[24.5px]">{line.slice(5)}</p>;
  }

  if (line.startsWith("### ")) {
    return <p className="pt-2.5 text-[14.5px] leading-[25.375px]">{line.slice(4)}</p>;
  }

  if (heading) {
    return <p className="text-[15.5px] leading-[27.125px]">{heading[1]}</p>;
  }

  if (numbered) {
    return (
      <p className="relative pl-5 text-[14.5px] leading-[25.375px]">
        <span className="absolute left-0.5 text-label leading-[22.75px] text-yellow-700">{numbered[1]}</span>
        {numbered[2]}
      </p>
    );
  }

  if (line.startsWith("- ")) {
    return (
      <p className="relative pl-3.5 text-[14.5px] leading-[25.375px]">
        <span className="absolute left-[3px] text-yellow-700">·</span>
        {line.slice(2)}
      </p>
    );
  }

  return <p className="text-[14.5px] leading-[25.375px]">{line}</p>;
}

function SummaryDetails({ summary }) {
  const emptyCount = SUMMARY_FIELDS.filter(({ key }) => !summary[key]).length;

  return (
    <details className="group w-full rounded-[20px] bg-tint-yellow px-[18px] py-3.5">
      <summary className="flex cursor-pointer list-none gap-1.5 [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="w-[15px] text-body group-open:hidden">▸</span>
        <span aria-hidden="true" className="hidden w-[15px] text-body group-open:inline">▾</span>
        <span className="text-body">
          자소서에 쓰는 요약{" "}
          <span className="text-label text-[#5a606c]">상황 · 행동 · 이유 · 결과 · 배운 점</span>
        </span>
      </summary>
      <dl className="pt-1">
        {SUMMARY_FIELDS.map(({ key, label }) => (
          <div key={key} className="grid grid-cols-[52px_minmax(0,1fr)] gap-3 border-t-2 border-dashed border-yellow-200 py-3 sm:grid-cols-[64px_minmax(0,1fr)]">
            <dt className="pt-0.5 text-label text-yellow-700">{label}</dt>
            <dd className="break-words text-body leading-[25.5px]">
              {summary[key] || (
                <span className="inline-block rounded-lg border border-dashed border-line-medium px-2.5 text-body-sm text-ink-subtle">
                  아직 기록에 없어요
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
      {emptyCount > 0 && (
        <p className="border-t border-dashed border-yellow-200 pt-3 text-label text-ink-subtle">
          ⚑ 빈칸 {emptyCount}곳은 자소서 초안에서도 빈칸으로 남아요. 수정에서 직접 채울 수 있어요.
        </p>
      )}
    </details>
  );
}

export default function StoryCardDetail({ card, competencies, titleId, onClose, onDelete, onUpdate }) {
  const { run, busy, error } = useProjectAction();
  const { type, whenLabel, title, tags, document, summary } = card;
  const isProjectCard = type === "project";
  const documentText = isProjectCard ? RECORD_TEXT : RECAP_TEXT;
  const { toast, showToast, hideToast } = useToast();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  async function copyDocument() {
    showToast((await copyText(document)) ? documentText.copied : COPY_FAILED_MESSAGE);
  }

  function handleSave(changes) {
    return run(async (signal) => {
      await onUpdate(changes, signal);
      if (!signal.aborted) { hideToast(); setIsEditing(false); }
    });
  }

  return (
    <fieldset disabled={busy} className="flex min-w-0 flex-col items-start gap-3.5 font-display text-[#1f2433] tracking-[-0.15px]">
      {error && <p role="alert">{error}</p>}
      <div className="flex w-full items-center gap-2.5">
        <span className="flex size-[52px] shrink-0 items-center justify-center"><StoryCardIcon card={card} size={50} /></span>
        <StoryCardTypeBadge type={type} />
        <span className="text-label text-placeholder">{whenLabel}</span>
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="ml-auto flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-canvas text-title"
        >
          ×
        </button>
      </div>
      {isEditing ? (
        <>
          <h2 id={titleId} className="sr-only">{title} 수정</h2>
          <div className="w-full">
            <StoryCardEditForm
              card={card}
              competencies={competencies}
              onCancel={() => setIsEditing(false)}
              onSave={handleSave}
            />
          </div>
        </>
      ) : (
        <>
          <h2 id={titleId} className="break-keep text-[24px] leading-[34px] text-balance tracking-[-0.48px]">
            {title}
          </h2>
          <CompetencyTags tags={tags} compact />
          <section className="w-full rounded-[20px] bg-canvas px-5 py-[18px]">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-body font-normal">{documentText.title}</h3>
              <Button size="sm" className="border-[#fef5d2]! bg-[#fef5d2]!" onClick={copyDocument}>노션에 복사</Button>
            </div>
            <div className="pt-2">
              {document
                .split("\n")
                .filter((line) => line.trim())
                .map((line, index) => (
                  <DocumentLine key={index} line={line} />
                ))}
            </div>
          </section>
          <SummaryDetails summary={summary} />
          {isConfirmingDelete ? (
            <div role="alert" className="flex w-full flex-col gap-2.5 rounded-2xl bg-tint-red px-4 py-3.5">
              <p className="text-body-sm">
                이 카드를 지울까요?
                <br />
                {/* 프로젝트 카드는 기록과 한 쌍이라 기록도 함께 지워진다(H-22). */}
                {isProjectCard ? "프로젝트의 이 기록도 함께 지워지고" : "그 주 스티커는 남고"}, 자소서 매칭에는 더 이상
                쓰이지 않아요. 지운 카드는 되돌릴 수 없어요.
              </p>
              <div className="flex items-center justify-between gap-3.5 pt-1">
                {/* 삭제 버튼이 사라져도 포커스를 잃지 않고, 안내가 화면에 보이도록 취소로 옮긴다. */}
                <TextLink variant="underline" className="text-[#4a5163]!" autoFocus onClick={() => setIsConfirmingDelete(false)}>
                  취소
                </TextLink>
                <Button variant="danger" className="h-[46px]! bg-error! px-6! font-display" onClick={() => run((signal) => onDelete(signal))}>지우기</Button>
              </div>
            </div>
          ) : (
            <div className="flex w-full items-center justify-between gap-3.5 pt-1">
              <TextLink variant="danger" className="text-error!" onClick={() => setIsConfirmingDelete(true)}>삭제</TextLink>
              <div className="flex gap-2">
                <Button variant="ink-outline" className="h-[46px]! px-6!" onClick={() => setIsEditing(true)}>수정</Button>
                <Button variant="ink" className="h-[46px]! px-6!" onClick={onClose}>닫기</Button>
              </div>
            </div>
          )}
        </>
      )}
      <Toast toast={toast} onDismiss={hideToast} />
    </fieldset>
  );
}
