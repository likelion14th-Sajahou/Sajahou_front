"use client";

import { COPY_FAILED_MESSAGE, PORTFOLIO_TEXT } from "@/components/my-record/storyCardTypes";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TextField from "@/components/ui/TextField";
import Toast, { useToast } from "@/components/ui/Toast";
import DotList from "./DotList";
import SidebarTitle from "./SidebarTitle";

const FINISH_STEPS = ["넣을 기록 고르기", "AI가 빈 곳을 찾아 질문·요청", "포트폴리오 완성"];

function FinishProjectCard({ onFinish }) {
  return (
    <Card as="aside" size="md" aria-label="프로젝트 마치기">
      <SidebarTitle>프로젝트를 마치면</SidebarTitle>
      <div className="pt-4">
        <DotList items={FINISH_STEPS} />
      </div>
      <div className="pt-3.5">
        <Button variant="accent" className="w-full" onClick={onFinish}>
          프로젝트 마치고 포트폴리오 만들기
        </Button>
      </div>
    </Card>
  );
}

// 완료한 프로젝트의 오른쪽 칸(H-21, 12-a). 저장한 포트폴리오는 기록을 바꿔도 자동으로 바뀌지 않아서, 필요하면 다시 만든다.
function PortfolioCard({ portfolio, onRemake }) {
  const { toast, showToast, hideToast } = useToast();

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(portfolio.markdown);
      showToast(PORTFOLIO_TEXT.copied);
    } catch {
      showToast(COPY_FAILED_MESSAGE);
    }
  }

  return (
    <Card as="aside" size="md" aria-label="포트폴리오">
      <SidebarTitle>포트폴리오</SidebarTitle>
      {portfolio ? (
        <>
          <div className="pt-4">
            <TextField
              multiline
              readOnly
              aria-label="저장한 포트폴리오"
              value={portfolio.markdown}
              className="h-[560px] text-[14.5px]! leading-[25.375px]"
            />
          </div>
          <div className="flex gap-2 pt-3">
            <Button size="sm" onClick={copyMarkdown}>Markdown 복사</Button>
            <Button size="sm" variant="secondary" onClick={onRemake}>다시 만들기</Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-start gap-3 pt-4">
          <p className="text-body-sm text-ink-subtle">아직 포트폴리오가 없어요</p>
          <Button size="sm" variant="secondary" onClick={onRemake}>포트폴리오 만들기</Button>
        </div>
      )}
      <Toast toast={toast} onDismiss={hideToast} />
    </Card>
  );
}

export default function ProjectSidebar({ status, portfolio, onMakePortfolio }) {
  return status === "done"
    ? <PortfolioCard portfolio={portfolio} onRemake={onMakePortfolio} />
    : <FinishProjectCard onFinish={onMakePortfolio} />;
}
