"use client";

import { useState } from "react";
import StoryCard from "@/components/my-record/StoryCard";
import StoryCardDetail from "@/components/my-record/StoryCardDetail";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import TextLink from "@/components/ui/TextLink";
import SidebarTitle from "./SidebarTitle";

const FINISH_STEPS = [
  "넣을 기록 고르기",
  "AI가 빈 곳을 찾아 질문·요청",
  "포트폴리오와 대표 카드 완성",
];

function FinishProjectCard({ onFinish }) {
  return (
    <Card as="aside" size="md" aria-label="프로젝트 마치기">
      <SidebarTitle>프로젝트를 마치면</SidebarTitle>
      <ul className="flex flex-col gap-1 pt-4">
        {FINISH_STEPS.map((step) => (
          <li key={step} className="relative pl-3.5 text-label text-ink-muted">
            <span aria-hidden="true" className="absolute top-[8.4px] left-0 size-1.5 rounded-full bg-shape-green" />
            {step}
          </li>
        ))}
      </ul>
      <div className="pt-3.5">
        <Button variant="accent" className="w-full" onClick={onFinish}>
          프로젝트 마치고 포트폴리오 만들기
        </Button>
      </div>
    </Card>
  );
}

// 이미 만든 대표 카드는 자동으로 바뀌지 않아서, 기록이 바뀌면 안내한다(H-21).
function RecordChangeNotice({ onDismiss }) {
  return (
    <div className="pt-4">
      <div role="status" className="rounded-[14px] border border-accent bg-[#fff6ec] px-3.5 py-3 text-ink">
        <p className="text-body">카드를 만든 뒤 기록이 바뀌었어요</p>
        <p className="mt-1 text-label leading-[19.5px]">
          이미 만든 카드는 그대로예요. 카드를 눌러 직접 고치거나, 바뀐 기록으로 대표 카드를 더 만들 수 있어요.
        </p>
        <TextLink onClick={onDismiss} className="mt-1.5">괜찮아요</TextLink>
      </div>
    </div>
  );
}

function RepresentativeCards({
  cards,
  competencies,
  showChangeNotice,
  onDismissChangeNotice,
  onUpdateCard,
  onDeleteCard,
}) {
  const [openCardId, setOpenCardId] = useState();
  const openCard = cards.find(({ id }) => id === openCardId);
  const isNoticeVisible = showChangeNotice && cards.length > 0;

  return (
    <Card as="aside" size="md" aria-label="대표 카드">
      <SidebarTitle>
        대표 카드 <span className="text-ink-subtle">{cards.length}장</span>
      </SidebarTitle>
      {isNoticeVisible && <RecordChangeNotice onDismiss={onDismissChangeNotice} />}
      <ol className={`flex flex-col gap-2.5 ${isNoticeVisible ? "pt-3" : "pt-4"}`}>
        {cards.map((card, index) => (
          <li key={card.id} className="flex flex-col">
            <p className="pb-1 pl-0.5 text-caption text-accent-strong">카드 {index + 1}</p>
            <StoryCard card={card} onOpen={setOpenCardId} />
          </li>
        ))}
      </ol>
      <div className="pt-3.5">
        <Button variant="secondary" className="w-full">+ 대표 카드 더 만들기</Button>
        <p className="pt-1.5 text-label leading-[19.5px] text-ink-subtle">
          회의나 발표가 끝날 때마다 새 기록으로 카드를 만들어 두면, 자소서 문항마다 다른 경험을 꺼내 쓸 수 있어요.
        </p>
      </div>
      <Modal
        open={Boolean(openCard)}
        onClose={() => setOpenCardId(undefined)}
        size="lg"
        aria-labelledby="representative-card-title"
      >
        {openCard && (
          <StoryCardDetail
            card={openCard}
            competencies={competencies}
            titleId="representative-card-title"
            onClose={() => setOpenCardId(undefined)}
            onDelete={() => {
              onDeleteCard(openCardId);
              setOpenCardId(undefined);
            }}
            onUpdate={(changes) => onUpdateCard(openCardId, changes)}
          />
        )}
      </Modal>
    </Card>
  );
}

export default function ProjectSidebar({ status, onFinishProject, ...cardProps }) {
  return status === "done"
    ? <RepresentativeCards {...cardProps} />
    : <FinishProjectCard onFinish={onFinishProject} />;
}
