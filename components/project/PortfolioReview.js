"use client";

import { useState } from "react";
import { COPY_FAILED_MESSAGE, PORTFOLIO_TEXT } from "@/components/my-record/storyCardTypes";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import Toast, { useToast } from "@/components/ui/Toast";
import { buildPortfolioMarkdown } from "./portfolioDraft";
import RecordFormFooter from "./RecordFormFooter";

// 3단계 포트폴리오 검토(H-18, 14). 카드는 만들지 않고(카드는 기록마다 이미 있다, H-22) Markdown만 저장한다.
export default function PortfolioReview({ project, records, filled, onBack, onSave }) {
  const isFirstPortfolio = project.status === "active";
  const [markdown, setMarkdown] = useState(() => buildPortfolioMarkdown(project, records, filled));
  const { toast, showToast, hideToast } = useToast();

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(markdown);
      showToast(PORTFOLIO_TEXT.copied);
    } catch {
      showToast(COPY_FAILED_MESSAGE);
    }
  }

  return (
    <>
      <p className="text-label leading-[20.8px] text-accent-strong">3 / 3 · 포트폴리오 검토</p>
      <div className="pt-3">
        <Card as="section" size="md" aria-labelledby="portfolio-title" className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center justify-between border-b border-ink pb-3">
            <h2 id="portfolio-title" className="text-[18px] tracking-[-0.18px] text-ink">프로젝트 포트폴리오</h2>
            <Button size="sm" onClick={copyMarkdown}>Markdown 복사</Button>
          </div>
          <p className="text-label leading-[19.5px] text-ink-subtle">
            노션이나 포트폴리오 사이트에 그대로 붙여 넣을 수 있어요.
          </p>
          <TextField
            multiline
            aria-label="포트폴리오"
            value={markdown}
            onChange={(event) => setMarkdown(event.target.value)}
            className="h-[560px] text-[14.5px]! leading-[25.375px]"
          />
          <RecordFormFooter>
            <TextLink onClick={onBack}>← 이전 질문으로</TextLink>
            <Button variant="accent" className="ml-auto" onClick={() => onSave(markdown)}>
              {isFirstPortfolio ? "포트폴리오 저장하고 프로젝트 완료로 표시" : "포트폴리오 저장"}
            </Button>
          </RecordFormFooter>
        </Card>
      </div>
      <Toast toast={toast} onDismiss={hideToast} />
    </>
  );
}
