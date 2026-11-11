"use client";

import { useState } from "react";
import { COPY_FAILED_MESSAGE, PORTFOLIO_TEXT } from "@/components/my-record/storyCardTypes";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import Toast, { useToast } from "@/components/ui/Toast";
import { copyText } from "@/lib/clipboard";
import ActionFooter from "@/components/ui/ActionFooter";
import CardTitle from "@/components/ui/CardTitle";
import useProjectAction from "./useProjectAction";
import BlankFieldsNotice from "@/components/ui/BlankFieldsNotice";
import { PORTFOLIO_FIELD_LABELS } from "@/lib/portfolioViewModel";

// 3단계 포트폴리오 검토(H-18, 14). 카드는 만들지 않고(카드는 기록마다 이미 있다, H-22) Markdown만 저장한다.
export default function PortfolioReview({ project, initialMarkdown, blanks = [], backLabel = "← 이전 질문으로", onBack, onSave }) {
  const isFirstPortfolio = project.status === "active";
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const { run, busy, error } = useProjectAction();
  const { toast, showToast, hideToast } = useToast();

  async function copyMarkdown() {
    showToast((await copyText(markdown)) ? PORTFOLIO_TEXT.copied : COPY_FAILED_MESSAGE);
  }

  return (
    <>
      <p className="text-label leading-[20.8px] text-accent-strong">3 / 3 · 포트폴리오 검토</p>
      <div className="pt-3">
        <Card as="section" size="md" aria-labelledby="portfolio-title" className="flex min-w-0 flex-col gap-3">
          <fieldset disabled={busy} className="flex min-w-0 flex-col gap-3">
          <BlankFieldsNotice labels={blanks.map((field) => PORTFOLIO_FIELD_LABELS[field]).filter(Boolean)} />
          <CardTitle id="portfolio-title" action={<Button size="sm" onClick={copyMarkdown}>Markdown 복사</Button>}>
            프로젝트 포트폴리오
          </CardTitle>
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
          <ActionFooter>
            <TextLink onClick={onBack}>{backLabel}</TextLink>
            <Button variant="accent" className="ml-auto max-w-full whitespace-normal!" onClick={() => run((signal) => onSave(markdown, signal))}>
              {isFirstPortfolio ? "포트폴리오 저장하고 프로젝트 완료로 표시" : "포트폴리오 저장"}
            </Button>
          </ActionFooter>
          {error && <p role="alert">{error}</p>}
          </fieldset>
        </Card>
      </div>
      <Toast toast={toast} onDismiss={hideToast} />
    </>
  );
}
