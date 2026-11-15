"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import { useMockData } from "@/components/layout/MockDataProvider";
import { EMPTY_TAGS_MESSAGE } from "@/components/my-record/CompetencyTagPicker";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DrawnBorder from "@/components/ui/DrawnBorder";
import MaterialsChangeNotice from "@/components/ui/MaterialsChangeNotice";
import RecordFieldsGrid from "./RecordFieldsGrid";
import TextLink from "@/components/ui/TextLink";
import Toast, { useToast } from "@/components/ui/Toast";
import ProjectRecordQuestions from "./ProjectRecordQuestions";
import ProjectRecordReview from "./ProjectRecordReview";
import RecordAttachmentsField from "./RecordAttachmentsField";
import RecordFormTitle from "./RecordFormTitle";
import { EMPTY_RECORD_MESSAGE } from "./recordFields";
import ActionFooter from "@/components/ui/ActionFooter";
import { createProjectRecord, updateProjectRecord, getRecordQuestionsWithRetry, organizeProjectRecord } from "@/lib/projectApi";
import { recordBody, recordQuestionState } from "@/lib/projectViewModel";
import AiWaitingNotice from "@/components/ui/AiWaitingNotice";
import Badge from "@/components/ui/Badge";
import BlankFieldsNotice from "@/components/ui/BlankFieldsNotice";
import { getAiErrorMessage } from "@/lib/requestErrorMessage";

// 기록 상자 제목줄의 날짜다. 새 기록은 오늘 날짜로 쌓인다('오늘 · 11/13(금)').
function todayLabel() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", weekday: "short" })
    .formatToParts(new Date()).map(({ type, value }) => [type, value]));
  return `오늘 · ${parts.month}/${parts.day}(${parts.weekday})`;
}

export default function ProjectRecordAddForm({ projectId, onCancel, onSave }) {
  const { projectData } = useMockData();
  const { authenticatedRequest } = useAuth();
  const [attachments, setAttachments] = useState([]);
  const [materials, setMaterials] = useState({});
  const [fields, setFields] = useState({});
  const [notice, setNotice] = useState("");
  const [step, setStep] = useState("materials");
  const [isOrganizedByAi, setIsOrganizedByAi] = useState(false);
  const [tags, setTags] = useState([]);
  const [draftId, setDraftId] = useState(null);
  const [busy, setBusy] = useState(false);
  // 지금 기다리는 AI 작업: "questions"(질문 받기, 30번) | "organize"(정리, 31번) | null. 저장 같은 다른 작업은 안내하지 않는다.
  const [aiTask, setAiTask] = useState(null);
  const [attachmentBusy, setAttachmentBusy] = useState(false);
  const [waitingForAttachments, setWaitingForAttachments] = useState(false);
  const pendingQuestionMode = useRef(null);
  const [questionState, setQuestionState] = useState({ questions: [], inputs: {}, index: 0, sourceAttachments: [] });
  const [confirmRegenerate, setConfirmRegenerate] = useState(null);
  const request = useRef(null);
  useEffect(() => () => request.current?.abort(), []);
  const { toast, showToast, hideToast } = useToast();
  const hasPendingAttachments = attachments.some((a) => a.extractStatus === "PENDING");
  // 폴링이 끝난 시점의 최신 입력·첨부를 사용하며, 요청 잠금으로 중복 진행을 막는다.
  const resumeAi = useEffectEvent(() => {
    if (pendingQuestionMode.current !== null) continueAi(pendingQuestionMode.current);
  });
  useEffect(() => {
    if (waitingForAttachments && !hasPendingAttachments && !attachmentBusy && step === "materials") resumeAi();
  }, [waitingForAttachments, hasPendingAttachments, attachmentBusy, step]);

  function cancelAttachmentWait() {
    pendingQuestionMode.current = null;
    setWaitingForAttachments(false);
  }

  function getFieldValueProps(key) {
    return {
      value: fields[key] ?? "",
      onChange: (event) => {
        setFields((current) => ({ ...current, [key]: event.target.value }));
        setNotice("");
      },
    };
  }

  function getTrimmedFields() {
    return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, value.trim()]));
  }

  // 최종 검토 내용 또는 첨부가 있어야 저장한다.
  function hasRecordContent() {
    return attachments.length > 0 || Object.values(getTrimmedFields()).some(Boolean);
  }

  async function saveRecord() {
    if (request.current) return;
    if (!hasRecordContent()) {
      showToast(EMPTY_RECORD_MESSAGE);
      return;
    }

    if (tags.length < 1 || tags.length > 3) {
      showToast(EMPTY_TAGS_MESSAGE);
      return;
    }

    const controller = new AbortController(); request.current = controller; setBusy(true); setNotice("");
    try {
      const body = recordBody({ ...getTrimmedFields(), attachments, tags, organizedByAi: isOrganizedByAi }, projectData.competencyItems, { isUpdate: Boolean(draftId) });
      const saved = draftId
        ? await updateProjectRecord(draftId, body, { signal: controller.signal, request: authenticatedRequest })
        : await createProjectRecord(projectId, { ...body, aiOrganize: false }, { signal: controller.signal, request: authenticatedRequest });
      controller.signal.throwIfAborted();
      setDraftId(saved.recordId);
      await onSave(saved);
    } catch (error) { if (!controller.signal.aborted) setNotice(error.message); }
    finally { request.current = null; if (!controller.signal.aborted) setBusy(false); }
  }

  function startAiSummary() {
    continueAi("AUTO");
  }

  async function continueAi(mode) {
    const regenerate = mode === "REGENERATE";
    if (request.current || attachmentBusy) return;
    if (hasPendingAttachments) {
      pendingQuestionMode.current = mode;
      setWaitingForAttachments(true); setNotice(""); return;
    }
    if (!attachments.length && !Object.values(materials).some((value) => value.trim())) {
      showToast(EMPTY_RECORD_MESSAGE);
      return;
    }
    cancelAttachmentWait();
    const controller = new AbortController(); request.current = controller; setAiTask("questions");
    const options = { signal: controller.signal, request: authenticatedRequest };
    setBusy(true); setNotice("");
    try {
      const { competencyIds: _tags, isAiOrganized: _ai, ...materialBody } = recordBody({ ...Object.fromEntries(Object.entries(materials).map(([key, value]) => [key, value.trim()])), attachments, tags: [] }, [], { isUpdate: Boolean(draftId) });
      let recordId = draftId;
      if (!draftId) {
        const draft = await createProjectRecord(projectId, { ...materialBody, aiOrganize: true }, options);
        controller.signal.throwIfAborted();
        recordId = draft.recordId;
        setDraftId(draft.recordId);
      } else await updateProjectRecord(draftId, materialBody, options);
      const result = await getRecordQuestionsWithRetry(recordId, { ...options, mode });
      controller.signal.throwIfAborted();
      setQuestionState((current) => recordQuestionState(current, result.questions, attachments, { regenerate }));
      setConfirmRegenerate(null);
      const insufficient = result.insufficientMaterial || result.questions.length === 0;
      setStep(insufficient ? "insufficient" : "questions");
    } catch (error) {
      if (!controller.signal.aborted) {
        if (error.status === 409 && error.code === "MATERIAL_CHANGED") {
          setConfirmRegenerate({ answerCount: error.detail?.answeredCount ?? null });
        } else if (error.status === 409 && error.code === "ATTACHMENT_PENDING") {
          setNotice("자료를 아직 읽고 있어요. 잠시 후 AI와 정리하기를 다시 눌러 주세요.");
        } else setNotice(getAiErrorMessage(error, error.message));
      }
    }
    finally { request.current = null; setAiTask(null); if (!controller.signal.aborted) setBusy(false); }
  }

  // 정리 결과에서 '← 질문으로'를 누르면 마지막 질문으로 돌아간다(H-14).
  function returnToQuestions() {
    setQuestionState((current) => ({ ...current, index: Math.max(0, current.questions.length - 1) }));
    setStep("questions");
  }

  async function showReview() {
    if (request.current) return;
    const controller = new AbortController(); request.current = controller; setBusy(true); setNotice(""); setAiTask("organize");
    try {
      const result = await organizeProjectRecord(draftId, { signal: controller.signal, request: authenticatedRequest });
      controller.signal.throwIfAborted();
      setFields({ did: result.did ?? "", problem: result.concern ?? "", choice: result.decision ?? "", result: result.result ?? "", next: result.nextStep ?? "" });
      setIsOrganizedByAi(true); setStep("review");
    } catch (error) { if (!controller.signal.aborted) setNotice(getAiErrorMessage(error, error.message)); }
    finally { request.current = null; setAiTask(null); if (!controller.signal.aborted) setBusy(false); }
  }

  function returnToMaterials() {
    setNotice("");
    setStep("materials");
  }

  // 자료가 부족할 때 '오늘 한 일 쓰러 가기': 자료 단계로 돌아가 첫 칸에 바로 쓸 수 있게 한다(13-g).
  function writeToday() {
    returnToMaterials();
    requestAnimationFrame(() => document.querySelector('[name="did"]')?.focus());
  }

  // AI 질문·자료 부족 단계는 진한 상자, 나머지는 회색 손그림 테두리의 흰 상자다(11/13 디자인).
  const isDark = step === "questions" || step === "insufficient";

  return (
    <Card as="section" size="md" className={`relative ${isDark ? "bg-ink-900! text-white" : ""}`} aria-labelledby="record-add-title">
      <DrawnBorder variant="start-card" color={isDark ? undefined : "var(--color-ink-300)"} />
      <fieldset disabled={busy} className="flex min-w-0 flex-col gap-4" aria-busy={busy}>
        <RecordFormTitle id="record-add-title" date={todayLabel()} tone={isDark ? "dark" : "light"}>기록 추가</RecordFormTitle>
        {step === "insufficient" && (
          <div className="flex flex-col gap-4">
            <p><Badge tone="brand">AI 질문</Badge></p>
            <h3 className="font-display text-title leading-[29px] text-white">자료가 부족해요</h3>
            <BlankFieldsNotice>읽을 수 있는 자료가 없어서 질문을 만들지 못했어요. ‘오늘 한 일’을 한 칸이라도 적거나, 자료를 PDF·TXT로 다시 올려 주세요.</BlankFieldsNotice>
            <div className="flex flex-wrap items-center gap-3">
              <TextLink variant="inverse-border" onClick={returnToMaterials}>← 자료로</TextLink>
              <Button variant="cta" className="ml-auto" onClick={writeToday}>오늘 한 일 쓰러 가기 →</Button>
            </div>
          </div>
        )}
        {step === "questions" && (
          <ProjectRecordQuestions
            state={questionState}
            onChange={setQuestionState}
            onBackToMaterials={returnToMaterials}
            onComplete={showReview}
          />
        )}
        {step === "review" && (
          <ProjectRecordReview
            attachments={attachments}
            fields={fields}
            isOrganizedByAi={isOrganizedByAi}
            competencies={projectData.competencyItems}
            tags={tags}
            getFieldValueProps={getFieldValueProps}
            onChangeTags={setTags}
            onTagLimit={showToast}
            onBack={isOrganizedByAi ? returnToQuestions : returnToMaterials}
            onSave={saveRecord}
          />
        )}
        {step === "materials" && (
          <div className="flex flex-col items-start gap-5">
            <div className="w-full">
              <RecordAttachmentsField
                onBusyChange={setAttachmentBusy}
                label={
                  <>
                    <span className="block font-display text-body leading-6 text-ink-strong">자료 첨부</span>
                    <span className="mt-1 block text-label leading-5 text-ink-subtle">어떤 자료인지 먼저 고르고 파일이나 링크를 올려 주세요.</span>
                  </>
                }
                attachments={attachments}
                onChange={(next) => {
                  if (next.map((a) => a.attachmentId).join() !== attachments.map((a) => a.attachmentId).join()) cancelAttachmentWait();
                  setAttachments(next);
                  setConfirmRegenerate(null);
                  setNotice("");
                }}
              />
            </div>
            <section className="w-full" aria-labelledby="record-materials-label">
              <h3 id="record-materials-label" className="mb-2 font-display text-body leading-6 text-ink-strong">오늘 한 일</h3>
              {/* 프로토타입처럼 다섯 칸을 2px 회색 테두리 상자로 묶는다. */}
              <div className="rounded-[18px] border-2 border-line p-[18px]">
                <RecordFieldsGrid getFieldProps={({ key, formLabel, placeholder }) => ({
                  label: formLabel,
                  placeholder,
                  value: materials[key] ?? "",
                  onChange: (event) => {
                    setMaterials((current) => ({ ...current, [key]: event.target.value }));
                    setConfirmRegenerate(null);
                    cancelAttachmentWait();
                    setNotice("");
                  },
                })} />
              </div>
            </section>
            {/* 질문을 받은 뒤 자료를 고쳤을 때의 확인(13-f). 회고 자료 화면과 같은 주황 상자다. */}
            <div className="w-full">
              <MaterialsChangeNotice
                open={Boolean(confirmRegenerate)}
                answerCount={confirmRegenerate?.answerCount ?? null}
                busy={busy}
                onCancel={() => { setConfirmRegenerate(null); cancelAttachmentWait(); }}
                onContinue={() => continueAi("CONTINUE")}
                onRegenerate={() => continueAi("REGENERATE")}
              />
            </div>
            {/* 첨부를 아직 읽는 중에 'AI와 정리하기'를 누르면 다 읽을 때까지 기다린다(13-d). */}
            {waitingForAttachments && (
              <div role="status" className="flex w-full flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1"><BlankFieldsNotice tone="wait">자료를 읽고 있어요. 잠시 후 질문을 시작해요.</BlankFieldsNotice></div>
                <TextLink size="sm" onClick={cancelAttachmentWait}>대기 취소</TextLink>
              </div>
            )}
            <ActionFooter>
              <TextLink onClick={onCancel}>취소</TextLink>
              <div className="ml-auto flex flex-wrap gap-2">
                <Button variant="ink" disabled={busy || attachmentBusy} aria-busy={waitingForAttachments} onClick={startAiSummary}>{waitingForAttachments ? "자료 읽는 중…" : busy ? "기록 준비 중…" : "AI와 정리하기 →"}</Button>
              </div>
            </ActionFooter>
          </div>
        )}
        <AiWaitingNotice active={aiTask !== null} doing={aiTask === "organize" ? "답을 바탕으로 기록을 정리하고 있어요" : "자료를 읽고 질문을 만들고 있어요"} className={isDark ? "text-locked!" : ""} />
        {notice && <p role="alert" className={`text-label ${isDark ? "text-tint-red" : "text-tint-red-ink"}`}>{notice} {step === "questions" && <TextLink size="sm" variant={isDark ? "inverse" : "link"} onClick={showReview}>정리 다시 시도</TextLink>}</p>}
      </fieldset>
      <Toast toast={toast} onDismiss={hideToast} />
    </Card>
  );
}
