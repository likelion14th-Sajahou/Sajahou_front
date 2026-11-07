"use client";

import { useState } from "react";
import CompetencyTagPicker, { EMPTY_TAGS_MESSAGE } from "@/components/my-record/CompetencyTagPicker";
import { COPY_FAILED_MESSAGE, PORTFOLIO_TEXT } from "@/components/my-record/storyCardTypes";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import Toast from "@/components/ui/Toast";
import { MOCK_PORTFOLIO_CARD } from "@/lib/mock/projects";
import DotList from "./DotList";
import {
  buildCardDraft,
  buildPortfolioMarkdown,
  getEvidenceItems,
  getPortfolioAttachments,
} from "./portfolioDraft";
import RecordFormFooter from "./RecordFormFooter";

const CARD_FIELDS = [
  { key: "situation", label: "상황" },
  { key: "action", label: "행동" },
  { key: "result", label: "결과" },
];

function ReviewTitle({ id, action, children }) {
  return (
    <div className="flex items-center justify-between border-b border-ink pb-3">
      <h2 id={id} className="text-[18px] tracking-[-0.18px] text-ink">{children}</h2>
      {action}
    </div>
  );
}

export default function PortfolioReview({ project, records, filled, competencies, onBack, onSave }) {
  const isFirstCard = project.status === "active";
  const firstCardPreset = isFirstCard ? MOCK_PORTFOLIO_CARD.firstCardByProject[project.id] : undefined;
  const attachmentCount = getPortfolioAttachments(records, filled).length;
  const [markdown, setMarkdown] = useState(() => buildPortfolioMarkdown(project, records, filled));
  const [title, setTitle] = useState(() => {
    if (firstCardPreset) {
      return firstCardPreset.title;
    }

    const did = records.find((record) => record.did)?.did;

    return did ? `${project.name} · ${did} 경험` : "";
  });
  const [fields, setFields] = useState(() => buildCardDraft(project, records, filled));
  const [tags, setTags] = useState(firstCardPreset?.tags ?? MOCK_PORTFOLIO_CARD.defaultTags);
  const [copyNotice, setCopyNotice] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopyNotice(PORTFOLIO_TEXT.copied);
    } catch {
      setCopyNotice(COPY_FAILED_MESSAGE);
    }
  }

  function saveCard() {
    if (!tags.length) {
      setToastMessage(EMPTY_TAGS_MESSAGE);
      return;
    }

    onSave({
      title: title.trim(),
      tags: competencies.filter((tag) => tags.includes(tag)),
      document: markdown,
      evidence: `프로젝트 기록 ${records.length}개 · 포트폴리오`,
      summary: {
        situation: fields.situation.trim(),
        action: fields.action.trim(),
        reason: "",
        result: fields.result.trim(),
        learned: filled.learned ?? "",
      },
      recordIds: records.map(({ id }) => id),
    });
  }

  return (
    <>
      <p className="text-label leading-[20.8px] text-accent-strong">3 / 3 · 포트폴리오 검토</p>
      <div className="grid grid-cols-[1.2fr_1fr] items-start gap-5 pt-3">
        <Card as="section" size="md" aria-labelledby="portfolio-title" className="flex min-w-0 flex-col gap-3">
          <ReviewTitle
            id="portfolio-title"
            action={<Button size="sm" onClick={copyMarkdown}>Markdown 복사</Button>}
          >
            프로젝트 포트폴리오
          </ReviewTitle>
          <p role="status" className="text-label leading-[19.5px] text-ink-subtle">
            {copyNotice || "노션이나 포트폴리오 사이트에 그대로 붙여 넣을 수 있어요."}
          </p>
          <TextField
            multiline
            aria-label="포트폴리오"
            value={markdown}
            onChange={(event) => {
              setMarkdown(event.target.value);
              setCopyNotice("");
            }}
            className="h-[560px] text-[14.5px]! leading-[25.375px]"
          />
        </Card>
        <Card as="section" size="md" aria-labelledby="portfolio-card-title" className="flex min-w-0 flex-col gap-3">
          <ReviewTitle id="portfolio-card-title" action={<Badge tone="yellow">프로젝트</Badge>}>
            대표 스토리 카드
          </ReviewTitle>
          <TextField label="제목" value={title} onChange={(event) => setTitle(event.target.value)} />
          {CARD_FIELDS.map(({ key, label }) => (
            <TextField
              key={key}
              label={label}
              multiline
              rows={2}
              value={fields[key]}
              onChange={(event) =>
                setFields((current) => ({ ...current, [key]: event.target.value }))
              }
              className="min-h-[76px] field-sizing-content"
            />
          ))}
          <CompetencyTagPicker
            id="portfolio-tags-label"
            competencies={competencies}
            selectedTags={tags}
            listClassName="gap-0"
            onChange={setTags}
            onLimit={setToastMessage}
          />
          <div className="flex flex-col gap-1.5">
            <p className="text-label text-ink-muted">근거로 쓴 기록과 자료</p>
            <DotList items={getEvidenceItems(records, attachmentCount)} />
          </div>
          {/* 시안의 간격(14px)이면 버튼이 카드 안쪽 여백을 넘어가서 좁힌다. */}
          <RecordFormFooter gapClassName="gap-2">
            <TextLink onClick={onBack}>← 빈 곳 다시 채우기</TextLink>
            <Button variant="accent" className="ml-auto" disabled={!title.trim()} onClick={saveCard}>
              {isFirstCard ? "대표 카드 저장하고 프로젝트 완료로 표시" : "대표 카드 저장"}
            </Button>
          </RecordFormFooter>
        </Card>
      </div>
      <Toast message={toastMessage} onDismiss={() => setToastMessage("")} />
    </>
  );
}
