"use client";

import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMockData } from "@/components/layout/MockDataProvider";
import Modal from "@/components/ui/Modal";
import Toast, { useToast } from "@/components/ui/Toast";
import ProjectPortfolio from "./ProjectPortfolio";
import ProjectHeader from "./ProjectHeader";
import ProjectRecords from "./ProjectRecords";
import ProjectSidebar from "./ProjectSidebar";
import RemoteProjectCard from "./RemoteProjectCard";
import * as api from "@/lib/projectApi";
import { recordBody } from "@/lib/projectViewModel";

function ProjectDetail({ project, initialIsAdding }) {
  const { records: projectRecords } = project;
  // 다른 페이지에 다녀와도 상태가 유지되므로(cacheComponents), 링크로 새로 들어오면 열려 있던 폼과 팝업을 닫는다.
  // 뒤로 가기로 돌아오면 bfcacheId가 그대로라 작성 중인 내용이 남는다. 기록과 카드 변경은 어느 경우든 유지한다.
  const router = useRouter();
  const { bfcacheId } = router;

  // 흐름을 연 시점의 bfcacheId를 기억해, 링크로 새로 들어오면 자동으로 프로젝트 화면으로 돌아간다.
  const [portfolioBfcacheId, setPortfolioBfcacheId] = useState(null);
  const isMakingPortfolio = portfolioBfcacheId === bfcacheId;
  // 기록의 '카드 보기'로 연 카드 팝업(A-10)이다. 링크로 새로 들어오면 닫히도록 연 시점의 bfcacheId도 기억한다.
  const [cardView, setCardView] = useState(null);
  const { toast, showToast, hideToast } = useToast();
  const {
    storyCards,
    showFlashToast,
    projectData,
  } = useMockData();
  const cards = storyCards.filter(({ projectId }) => projectId === project.id);
  const viewingCard =
    cardView?.bfcacheId === bfcacheId
      ? projectRecords.find(({ id }) => id === cardView.recordId)
      : undefined;
  const records = projectRecords;

  // 기록을 저장하면 나의 사자록에 프로젝트 카드 1장이 함께 생긴다(H-22).
  async function addRecord() {
    await projectData.sync(project.id);
    showToast("기록을 저장했어요 · 나의 사자록에 카드 1장");
  }

  // 기록을 고치거나 지우면 카드도 함께 바뀌고, 따로 안내하지 않는다(H-21).
  async function saveRecord(recordId, changes, signal) {
    const record = projectRecords.find((r) => r.id === recordId);
    const body = Object.keys(changes).length === 1 && "result" in changes ? { result: changes.result } : recordBody({ ...record, ...changes }, projectData.competencyItems);
    await api.updateProjectRecord(recordId, body, { signal });
    await projectData.sync(project.id);
  }

  async function deleteRecord(recordId) {
    await api.deleteProjectRecord(recordId);
    await projectData.sync(project.id);
  }

  // 지우면 프로젝트 목록으로 옮겨 가서 안내한다(H-25). 이동과 삭제를 한 번에 반영해, 지운 프로젝트의 '찾을 수 없어요' 화면이 잠깐 보이지 않게 한다.
  async function removeProject(signal) {
    await api.deleteProject(project.id, { signal });
    signal?.throwIfAborted();
    showFlashToast(`‘${project.name}’ 프로젝트를 지웠어요`);
    startTransition(() => {
      router.push("/projects");
      projectData.forget(project.id);
    });
    await projectData.sync();
  }

  // 포트폴리오 Markdown만 저장한다. 처음이면 프로젝트를 완료로 바꾸고, 다시 만들면 안내한다(H-18).
  async function savePortfolio(markdown, signal) {
    const result = await api.savePortfolio(project.id, markdown, { signal });
    signal?.throwIfAborted();
    await projectData.sync(project.id);
    showToast(result.isFirstCompletion ? "프로젝트를 완료했어요" : "포트폴리오를 다시 저장했어요");
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
        <div className="grid grid-cols-1 items-start gap-5 pt-6 lg:grid-cols-[minmax(0,1fr)_320px]">
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
            status={project.status}
            portfolio={project.portfolio}
            deleteProps={{ recordCount: records.length, cardCount: cards.length, onDelete: removeProject }}
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
          <RemoteProjectCard key={viewingCard.cardId} cardId={viewingCard.cardId} titleId="record-card-title" onClose={() => setCardView(null)} />
        )}
      </Modal>
      <Toast toast={toast} onDismiss={hideToast} />
      {projectData.syncWarning && <p role="alert">{projectData.syncWarning}</p>}
    </>
  );
}

export default function ProjectView({ projectId, initialIsAdding }) {
  const { projects, projectData } = useMockData();
  const [detailStatus, setDetailStatus] = useState("loading");
  const [detailError, setDetailError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const { loadProject } = projectData;
  useEffect(() => {
    const controller = new AbortController();
    loadProject(projectId, { signal: controller.signal }).then(() => { if (!controller.signal.aborted) setDetailStatus("ready"); }).catch((error) => {
      if (!controller.signal.aborted) { setDetailError(error.message); setDetailStatus("error"); }
    });
    return () => controller.abort();
  }, [projectId, loadProject, attempt]);
  const project = projects.find(({ id }) => id === projectId);

  if (detailStatus === "loading") return <p role="status">프로젝트를 불러오고 있어요…</p>;
  if (detailStatus === "error") return <div><Link href="/projects">← 프로젝트</Link><p role="alert">{detailError}</p><button onClick={() => setAttempt((n) => n + 1)}>다시 시도</button></div>;

  if (!project) {
    return (
      <div className="flex flex-col items-start gap-3">
        <Link href="/projects" className="text-body-sm text-ink-muted">
          ← 프로젝트
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
      initialIsAdding={initialIsAdding}
    />
  );
}
