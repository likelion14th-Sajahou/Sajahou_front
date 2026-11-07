"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMockData } from "@/components/layout/MockDataProvider";
import StoryCardDetail from "@/components/my-record/StoryCardDetail";
import Modal from "@/components/ui/Modal";
import Toast, { useToast } from "@/components/ui/Toast";
import { MOCK_TODAY } from "@/lib/mock/projects";
import ProjectPortfolio from "./ProjectPortfolio";
import ProjectHeader from "./ProjectHeader";
import ProjectRecords from "./ProjectRecords";
import ProjectSidebar from "./ProjectSidebar";

function ProjectDetail({ project, competencies, initialIsAdding, onChangeProject }) {
  const { records: projectRecords, status } = project;
  // 다른 페이지에 다녀와도 상태가 유지되므로(cacheComponents), 링크로 새로 들어오면 열려 있던 폼과 팝업을 닫는다.
  // 뒤로 가기로 돌아오면 bfcacheId가 그대로라 작성 중인 내용이 남는다. 기록과 카드 변경은 어느 경우든 유지한다.
  const { bfcacheId } = useRouter();

  // 흐름을 연 시점의 bfcacheId를 기억해, 링크로 새로 들어오면 자동으로 프로젝트 화면으로 돌아간다.
  const [portfolioBfcacheId, setPortfolioBfcacheId] = useState(null);
  const isMakingPortfolio = portfolioBfcacheId === bfcacheId;
  // 기록의 '카드 보기'로 연 카드 팝업(A-10)이다. 링크로 새로 들어오면 닫히도록 연 시점의 bfcacheId도 기억한다.
  const [cardView, setCardView] = useState(null);
  const { toast, showToast, hideToast } = useToast();
  const {
    storyCards,
    updateStoryCard,
    deleteStoryCard,
    addProjectRecord,
    updateProjectRecord,
    deleteProjectRecord,
  } = useMockData();
  const cards = storyCards.filter(({ projectId }) => projectId === project.id);
  const viewingCard =
    cardView?.bfcacheId === bfcacheId
      ? cards.find(({ recordId }) => recordId === cardView.recordId)
      : undefined;
  const records = projectRecords;

  // 기록을 저장하면 나의 사자록에 프로젝트 카드 1장이 함께 생긴다(H-22).
  function addRecord(record) {
    addProjectRecord(project.id, { id: crypto.randomUUID(), ...MOCK_TODAY, ...record });
    showToast("기록을 저장했어요 · 나의 사자록에 카드 1장");
  }

  // 기록을 고치거나 지우면 카드도 함께 바뀌고, 따로 안내하지 않는다(H-21).
  function saveRecord(recordId, changes) {
    updateProjectRecord(project.id, recordId, changes);
  }

  function deleteRecord(recordId) {
    deleteProjectRecord(project.id, recordId);
  }

  // 포트폴리오 Markdown만 저장한다. 처음이면 프로젝트를 완료로 바꾸고, 다시 만들면 안내한다(H-18).
  function savePortfolio(markdown) {
    // 처음 마치면 오늘을 마친 날로 기록하고, 검토 화면에서 '진행 중'이던 기간도 그 날로 바꿔 저장한다.
    const endedAt = project.endedAt ?? MOCK_TODAY.date;
    const periodLine = `- 기간: ${project.startedAt} ~ 진행 중`;
    const savedMarkdown = markdown.replace(periodLine, `- 기간: ${project.startedAt} ~ ${endedAt}`);

    if (status === "done") {
      showToast("포트폴리오를 다시 저장했어요");
    }

    onChangeProject((current) => ({
      ...current,
      status: "done",
      endedAt,
      portfolio: { markdown: savedMarkdown },
    }));
    setPortfolioBfcacheId(null);
    // 검토 화면 아래쪽에서 저장하므로, 바뀐 프로젝트 화면을 처음부터 보여 준다.
    window.scrollTo(0, 0);
  }

  return (
    <>
      <ProjectHeader
        project={project}
        recordCount={records.length}
        lastRecordedAt={records[0]?.date}
      />
      {isMakingPortfolio ? (
        <div className="pt-6">
          <ProjectPortfolio
            project={project}
            records={records}
            onCancel={() => setPortfolioBfcacheId(null)}
            onSave={savePortfolio}
          />
        </div>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-5 pt-6">
          <ProjectRecords
            key={`records-${bfcacheId}`}
            project={project}
            records={records}
            initialIsAdding={initialIsAdding}
            onAddRecord={addRecord}
            onSaveRecord={saveRecord}
            onDeleteRecord={deleteRecord}
            onViewCard={(recordId) => setCardView({ recordId, bfcacheId })}
          />
          <ProjectSidebar
            key={`sidebar-${bfcacheId}`}
            status={status}
            portfolio={project.portfolio}
            onMakePortfolio={() => setPortfolioBfcacheId(bfcacheId)}
          />
        </div>
      )}
      <Modal
        open={Boolean(viewingCard)}
        onClose={() => setCardView(null)}
        size="lg"
        aria-labelledby="record-card-title"
      >
        {viewingCard && (
          <StoryCardDetail
            card={viewingCard}
            competencies={competencies}
            titleId="record-card-title"
            onClose={() => setCardView(null)}
            onDelete={() => {
              deleteStoryCard(viewingCard.id);
              setCardView(null);
            }}
            onUpdate={(changes) => updateStoryCard(viewingCard.id, changes)}
          />
        )}
      </Modal>
      <Toast toast={toast} onDismiss={hideToast} />
    </>
  );
}

export default function ProjectView({ projectId, initialIsAdding }) {
  const { competencies, projects, updateProject } = useMockData();
  const project = projects.find(({ id }) => id === projectId);

  if (!project) {
    return (
      <div className="flex flex-col items-start gap-3">
        <Link href="/" className="text-body-sm text-ink-muted">
          ← 홈
        </Link>
        <p role="status" className="text-body text-ink-subtle">
          프로젝트를 찾을 수 없어요.
        </p>
      </div>
    );
  }

  return (
    <ProjectDetail
      project={project}
      competencies={competencies}
      initialIsAdding={initialIsAdding}
      onChangeProject={(update) => updateProject(projectId, update)}
    />
  );
}
