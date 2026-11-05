"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import TextLink from "@/components/ui/TextLink";
import { getStoryCardDetail } from "@/lib/mock/storyCards";
import CompetencyTags from "./CompetencyTags";
import { STORY_CARD_TYPES } from "./storyCardTypes";

const SUMMARY_FIELDS = [
  { key: "situation", label: "상황" },
  { key: "action", label: "행동" },
  { key: "reason", label: "이유" },
  { key: "result", label: "결과" },
  { key: "learned", label: "배운 점" },
];

const RECAP_TEXT = {
  title: "회고록 전문",
  copied: "회고록을 복사했어요. 노션에 붙여 넣어 주세요.",
};

const PORTFOLIO_TEXT = {
  title: "포트폴리오 전문",
  copied: "포트폴리오를 복사했어요. 노션에 붙여 넣어 주세요.",
};

const COPY_FAILED_MESSAGE = "복사하지 못했어요. 브라우저의 클립보드 권한을 확인한 뒤 다시 시도해 주세요.";

// 회고록 Markdown을 줄 단위로 읽어 시안의 글자 크기로 표시한다.
function DocumentLine({ line }) {
  const numbered = line.match(/^(\d+)\. (.*)$/);

  if (line.startsWith("#### ")) {
    return <p className="pt-2 text-body-sm leading-[24.5px]">{line.slice(5)}</p>;
  }

  if (line.startsWith("### ")) {
    return <p className="pt-2.5 text-[14.5px] leading-[25.375px]">{line.slice(4)}</p>;
  }

  if (line.startsWith("## ")) {
    return <p className="text-[15.5px] leading-[27.125px]">{line.slice(3)}</p>;
  }

  if (numbered) {
    return (
      <p className="relative pl-5 text-[14.5px] leading-[25.375px]">
        <span className="absolute left-0.5 text-label leading-[22.75px] text-accent-strong">{numbered[1]}</span>
        {numbered[2]}
      </p>
    );
  }

  if (line.startsWith("- ")) {
    return (
      <p className="relative pl-3.5 text-[14.5px] leading-[25.375px]">
        <span className="absolute left-[3px] text-accent-strong">·</span>
        {line.slice(2)}
      </p>
    );
  }

  return <p className="text-[14.5px] leading-[25.375px]">{line}</p>;
}

function SummaryDetails({ summary }) {
  const emptyCount = SUMMARY_FIELDS.filter(({ key }) => !summary[key]).length;

  return (
    <details className="group w-full rounded-2xl border border-line px-4 py-3">
      <summary className="flex cursor-pointer list-none gap-1.5 [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="w-[15px] text-body group-open:hidden">▸</span>
        <span aria-hidden="true" className="hidden w-[15px] text-body group-open:inline">▾</span>
        <span className="text-body">
          자소서에 쓰는 요약{" "}
          <span className="text-label text-ink-subtle">상황 · 행동 · 이유 · 결과 · 배운 점</span>
        </span>
      </summary>
      <dl className="pt-1.5">
        {SUMMARY_FIELDS.map(({ key, label }) => (
          <div key={key} className="grid grid-cols-[64px_1fr] gap-3 border-t border-line py-3">
            <dt className="pt-0.5 text-label text-accent-strong">{label}</dt>
            <dd className="text-body leading-[25.5px]">
              {summary[key] || (
                <span className="inline-block rounded-lg border border-dashed border-[#d7d3cb] px-2.5 text-body-sm text-ink-subtle">
                  아직 기록에 없어요
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
      {emptyCount > 0 && (
        <p className="border-t border-line pt-3 text-label text-ink-subtle">
          ⚑ 빈칸 {emptyCount}곳은 자소서 초안에서도 빈칸으로 남아요. 수정에서 직접 채울 수 있어요.
        </p>
      )}
    </details>
  );
}

export default function StoryCardDetail({ card, titleId, onClose, onDelete }) {
  const { type, whenLabel, shape, color, title, tags, evidence } = card;
  const { label, tone } = STORY_CARD_TYPES[type];
  const { document, summary } = getStoryCardDetail(card);
  const documentText = type === "project" ? PORTFOLIO_TEXT : RECAP_TEXT;
  const [copyNotice, setCopyNotice] = useState("");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  async function copyDocument() {
    try {
      await navigator.clipboard.writeText(document);
      setCopyNotice(documentText.copied);
    } catch {
      setCopyNotice(COPY_FAILED_MESSAGE);
    }
  }

  return (
    <div className="flex flex-col items-start gap-3.5">
      <div className="flex w-full items-center gap-2.5">
        <ShapeCharacter shape={shape} color={color} size={36} />
        <Badge tone={tone}>{label}</Badge>
        <span className="text-label text-ink-subtle">{whenLabel}</span>
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="ml-auto flex size-9 cursor-pointer items-center justify-center rounded-full bg-canvas text-title"
        >
          ×
        </button>
      </div>
      <h2 id={titleId} className="break-keep text-heading leading-[30.8px] tracking-[-0.44px]">
        {title}
      </h2>
      <CompetencyTags tags={tags} />
      <section className="w-full rounded-2xl border border-line px-4 py-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-body font-normal">{documentText.title}</h3>
          <Button size="sm" onClick={copyDocument}>노션에 복사</Button>
        </div>
        {copyNotice && (
          <p role="status" className="pt-2 text-label text-ink-subtle">{copyNotice}</p>
        )}
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
      <p className="flex w-full gap-2.5 rounded-[14px] bg-canvas px-3.5 py-3 text-[13.5px] leading-[21.6px]">
        <span className="shrink-0">근거</span>
        <span>{evidence}</span>
      </p>
      {isConfirmingDelete ? (
        <div role="alert" className="flex w-full flex-col gap-2.5 rounded-2xl bg-[#fdecea] px-4 py-3.5">
          <p className="text-body-sm">
            이 카드를 지울까요?
            <br />
            그 주 스티커는 남고, 자소서 매칭에는 더 이상 쓰이지 않아요. 지운 카드는 되돌릴 수 없어요.
          </p>
          <div className="flex items-center justify-between gap-3.5 pt-1">
            {/* 삭제 버튼이 사라져도 포커스를 잃지 않고, 안내가 화면에 보이도록 취소로 옮긴다. */}
            <TextLink autoFocus onClick={() => setIsConfirmingDelete(false)}>
              취소
            </TextLink>
            <Button variant="danger" onClick={onDelete}>지우기</Button>
          </div>
        </div>
      ) : (
        <div className="flex w-full items-center justify-between gap-3.5 pt-1">
          <TextLink variant="danger" onClick={() => setIsConfirmingDelete(true)}>삭제</TextLink>
          <div className="flex gap-2">
            <Button variant="secondary">수정</Button>
            <Button onClick={onClose}>닫기</Button>
          </div>
        </div>
      )}
    </div>
  );
}
