"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMockData } from "@/components/layout/MockDataProvider";
import Toast from "@/components/ui/Toast";
import { MOCK_TODAY } from "@/lib/mock/projects";
import { MOCK_WEEK } from "@/lib/mock/week";
import ProjectPortfolio from "./ProjectPortfolio";
import ProjectHeader from "./ProjectHeader";
import ProjectRecords from "./ProjectRecords";
import ProjectSidebar from "./ProjectSidebar";

function ProjectDetail({ project, competencies, initialIsAdding, onChangeProject }) {
  const { records: projectRecords, status } = project;
  // 다른 페이지에 다녀와도 상태가 유지되므로(cacheComponents), 링크로 새로 들어오면 열려 있던 폼과 팝업을 닫는다.
  // 뒤로 가기로 돌아오면 bfcacheId가 그대로라 작성 중인 내용이 남는다. 기록과 카드 변경은 어느 경우든 유지한다.
  const { bfcacheId } = useRouter();
  const [hasRecordChanged, setHasRecordChanged] = useState(false);
  const currentProject = { ...project, lastRecordedAt: projectRecords[0]?.date };

  // 흐름을 연 시점의 bfcacheId를 기억해, 링크로 새로 들어오면 자동으로 프로젝트 화면으로 돌아간다.
  const [portfolioBfcacheId, setPortfolioBfcacheId] = useState(null);
  const isMakingPortfolio = portfolioBfcacheId === bfcacheId;
  const [toastMessage, setToastMessage] = useState("");
  const {
    storyCards,
    addStoryCard,
    updateStoryCard,
    deleteStoryCard,
    addProjectRecord,
    updateProjectRecord,
    deleteProjectRecord,
  } = useMockData();
  const cards = storyCards.filter(({ projectId }) => projectId === project.id);
  const records = projectRecords;

  // 기록을 저장하면 나의 사자록에 프로젝트 카드 1장이 함께 생긴다(H-22).
  function addRecord(record) {
    setHasRecordChanged(true);
    addProjectRecord(project.id, { id: crypto.randomUUID(), ...MOCK_TODAY, tags: [], ...record });
  }

  function saveRecord(recordId, changes) {
    const record = projectRecords.find(({ id }) => id === recordId);

    // 저장만 누르고 내용이 그대로면 기록이 바뀐 것이 아니다.
    if (Object.entries(changes).some(([key, value]) => (record[key] ?? "") !== value)) {
      setHasRecordChanged(true);
    }

    updateProjectRecord(project.id, recordId, changes);
  }

  function deleteRecord(recordId) {
    setHasRecordChanged(true);
    deleteProjectRecord(project.id, recordId);
  }

  function saveCard(card) {
    addStoryCard({
      id: crypto.randomUUID(),
      projectId: project.id,
      week: project.recap?.week ?? MOCK_WEEK.week,
      type: "project",
      whenLabel: project.name,
      shape: "sunFine",
      color: "yellow",
      ...card,
    });
    // 처음 마칠 때는 완료 표시가 저장을 알려 주므로, 더 만들 때만 안내한다(H-18).
    if (status === "done") {
      setToastMessage(`대표 카드를 하나 더 저장했어요 (${cards.length + 1}장)`);
    }

    onChangeProject((current) => ({ ...current, status: "done" }));
    setHasRecordChanged(false);
    setPortfolioBfcacheId(null);
    // 검토 화면 아래쪽에서 저장하므로, 바뀐 프로젝트 화면을 처음부터 보여 준다.
    window.scrollTo(0, 0);
  }

  return (
    <>
      <ProjectHeader
        project={currentProject}
        recordCount={records.length}
        lastRecordedAt={records[0]?.date}
      />
      {isMakingPortfolio ? (
        <div className="pt-6">
          <ProjectPortfolio
            project={currentProject}
            cardNumber={cards.length + 1}
            records={records}
            competencies={competencies}
            onCancel={() => setPortfolioBfcacheId(null)}
            onSaveCard={saveCard}
          />
        </div>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_320px] items-start gap-5 pt-6">
          <ProjectRecords
            key={`records-${bfcacheId}`}
            project={currentProject}
            records={records}
            initialIsAdding={initialIsAdding}
            onAddRecord={addRecord}
            onSaveRecord={saveRecord}
            onDeleteRecord={deleteRecord}
          />
          <ProjectSidebar
            key={`sidebar-${bfcacheId}`}
            status={status}
            cards={cards}
            competencies={competencies}
            showChangeNotice={hasRecordChanged}
            onDismissChangeNotice={() => setHasRecordChanged(false)}
            onUpdateCard={updateStoryCard}
            onDeleteCard={deleteStoryCard}
            onMakePortfolio={() => setPortfolioBfcacheId(bfcacheId)}
          />
        </div>
      )}
      <Toast message={toastMessage} onDismiss={() => setToastMessage("")} />
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
