"use client";

import { useState } from "react";
import Image from "next/image";
import { COPY_FAILED_MESSAGE, PORTFOLIO_TEXT } from "@/components/my-record/storyCardTypes";
import Button from "@/components/ui/Button";
import DrawnBorder from "@/components/ui/DrawnBorder";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import Toast, { useToast } from "@/components/ui/Toast";
import DeleteConfirm from "./DeleteConfirm";
import { copyText } from "@/lib/clipboard";
import useProjectAction from "./useProjectAction";

const FINISH_STEPS = ["넣을 기록 고르기", "AI가 빈 곳을 찾아 질문·요청", "포트폴리오 완성"];

// 진행 중의 오른쪽 안내와 완료 프로젝트 상단의 포트폴리오에 쓰는 프로젝트 전용 카드다.
function SideCard({ dark = false, title, label, description, children }) {
  return (
    <aside aria-label={label} className={`relative flex min-w-0 flex-col rounded-[24px] p-6 ${dark ? "bg-ink-900 text-white" : "bg-white text-ink"}`}>
      <DrawnBorder variant="start-card" color={dark ? undefined : "var(--color-yellow-400)"} />
      <div className={`mb-4 flex items-center justify-between gap-3 border-b pb-3 ${dark ? "border-white" : "border-ink-strong"}`}>
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
          <h2 className={`font-display text-[18px] leading-[29px] ${dark ? "text-white" : "text-ink-strong"}`}>{title}</h2>
          {description && <p className="text-label text-ink-subtle">{description}</p>}
        </div>
        <Image src="/images/retrospective/bullet-star-4.png" alt="" width={22} height={22} className="object-contain" />
      </div>
      {children}
    </aside>
  );
}

// '프로젝트 삭제'(H-25, 12-g). 진행 중은 안내 카드 안, 완료는 기록 목록 아래에 둔다.
export function DeleteProject({ recordCount, cardCount, onDelete }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const { run, busy, error } = useProjectAction();

  return (
    <fieldset disabled={busy} className="flex min-w-0 flex-col items-center pt-4">
      {isConfirming ? (
        <DeleteConfirm
          title="이 프로젝트를 지울까요?"
          message={`기록 ${recordCount}개와 나의 사자록의 프로젝트 카드 ${cardCount}장도 함께 지워져요. 지운 프로젝트는 되돌릴 수 없어요.`}
          onCancel={() => setIsConfirming(false)}
          onConfirm={() => run(onDelete)}
        />
      ) : (
        <TextLink variant="danger" size="sm" className="text-error!" onClick={() => setIsConfirming(true)}>
          프로젝트 삭제
        </TextLink>
      )}
      {error && <p role="alert">{error}</p>}
    </fieldset>
  );
}

function FinishProjectCard({ deleteProps, onFinish }) {
  return (
    <SideCard dark title="프로젝트를 마치면" label="프로젝트 마치기">
      <ol className="flex flex-col gap-2.5">
        {FINISH_STEPS.map((step, index) => (
          <li key={step} className="flex items-center gap-2.5 text-body-sm leading-[22px]">
            <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-yellow-400 text-caption font-bold text-ink-950">{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>
      <Button variant="soft" className="mt-5 w-full whitespace-normal!" onClick={onFinish}>
        프로젝트 마치고 포트폴리오 만들기
      </Button>
      <DeleteProject {...deleteProps} />
    </SideCard>
  );
}

// 완료한 프로젝트 상단의 포트폴리오(H-21, 12-a). 기록을 바꿔도 자동으로 바뀌지 않아서, 필요하면 다시 만든다.
export function PortfolioCard({ portfolio, onRemake }) {
  const { toast, showToast, hideToast } = useToast();

  async function copyMarkdown() {
    showToast((await copyText(portfolio.markdown)) ? PORTFOLIO_TEXT.copied : COPY_FAILED_MESSAGE);
  }

  return (
    <SideCard title="포트폴리오" label="포트폴리오" description="노션·포트폴리오 사이트에 그대로 붙여 넣을 수 있어요">
      {portfolio ? (
        <>
          {/* 저장한 포트폴리오는 사용자가 만든 글이라 Pretendard(font-input)다. */}
          <TextField
            multiline
            readOnly
            aria-label="저장한 포트폴리오"
            value={portfolio.markdown}
            className="h-[520px] font-input text-[15.5px]! leading-[27.9px] text-ink-strong!"
          />
          <div className="flex flex-wrap gap-2 pt-3">
            <Button variant="ink" size="sm" onClick={copyMarkdown}>Markdown 복사</Button>
            <Button variant="ink-outline" size="sm" onClick={onRemake}>다시 만들기</Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-stretch gap-3">
          <p className="text-body-sm text-ink-subtle">아직 포트폴리오가 없어요.</p>
          <Button variant="cta" onClick={onRemake}>포트폴리오 만들기</Button>
        </div>
      )}
      <Toast toast={toast} onDismiss={hideToast} />
    </SideCard>
  );
}

export default function ProjectSidebar({ status, portfolio, deleteProps, onMakePortfolio }) {
  return status === "done"
    ? <><PortfolioCard portfolio={portfolio} onRemake={onMakePortfolio} /><DeleteProject {...deleteProps} /></>
    : <FinishProjectCard deleteProps={deleteProps} onFinish={onMakePortfolio} />;
}
