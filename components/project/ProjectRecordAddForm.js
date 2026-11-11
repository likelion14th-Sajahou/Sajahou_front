"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import { useMockData } from "@/components/layout/MockDataProvider";
import { EMPTY_TAGS_MESSAGE } from "@/components/my-record/CompetencyTagPicker";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import Toast, { useToast } from "@/components/ui/Toast";
import ProjectRecordQuestions from "./ProjectRecordQuestions";
import ProjectRecordReview from "./ProjectRecordReview";
import RecordAttachmentsField from "./RecordAttachmentsField";
import RecordFieldsGrid from "./RecordFieldsGrid";
import RecordFormTitle from "./RecordFormTitle";
import { EMPTY_RECORD_MESSAGE } from "./recordFields";
import ActionFooter from "@/components/ui/ActionFooter";
import { createProjectRecord, updateProjectRecord, getRecordQuestions, organizeProjectRecord } from "@/lib/projectApi";
import { recordBody, recordQuestionState } from "@/lib/projectViewModel";
import AiWaitingNotice from "@/components/ui/AiWaitingNotice";
import BlankFieldsNotice from "@/components/ui/BlankFieldsNotice";
import { getAiErrorMessage } from "@/lib/requestErrorMessage";

export default function ProjectRecordAddForm({ projectId, onCancel, onSave }) {
  const { projectData } = useMockData();
  const { authenticatedRequest } = useAuth();
  const [attachments, setAttachments] = useState([]);
  const [memo, setMemo] = useState("");
  const [fields, setFields] = useState({});
  const [isWritingFields, setIsWritingFields] = useState(false);
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
  const [insufficientMaterial, setInsufficientMaterial] = useState(false);
  const firstDirectField = useRef(null);
  const focusDirectField = useRef(false);
  const request = useRef(null);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    if (!busy && step === "materials" && isWritingFields && focusDirectField.current) {
      firstDirectField.current?.focus();
      focusDirectField.current = false;
    }
  }, [busy, step, isWritingFields]);
  const { toast, showToast, hideToast } = useToast();
  const hasPendingAttachments = attachments.some((a) => a.extractStatus === "PENDING");
  // 폴링이 끝난 시점의 최신 메모·첨부를 사용하며, 요청 잠금으로 중복 진행을 막는다.
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

  // 메모만으로 직접 저장하지 않지만, 저장할 때 메모 원문도 함께 보관한다.
  function hasRecordContent() {
    return attachments.length > 0 || Object.values(getTrimmedFields()).some(Boolean);
  }

  // 5칸을 직접 채운 경우에도 정리 결과 확인에서 역량 태그를 고른 뒤 저장한다(H-12).
  function organizeDirectly() {
    cancelAttachmentWait();
    setConfirmRegenerate(null);
    if (attachmentBusy) { setNotice("선택한 파일을 첨부하거나 선택을 취소한 뒤 진행해 주세요."); return; }
    if (!hasRecordContent()) {
      showToast(EMPTY_RECORD_MESSAGE);
      return;
    }

    setIsOrganizedByAi(false);
    setStep("review");
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
        ? await updateProjectRecord(draftId, { ...body, memo: memo.trim() }, { signal: controller.signal, request: authenticatedRequest })
        : await createProjectRecord(projectId, { ...body, memo: memo.trim() || null, aiOrganize: false }, { signal: controller.signal, request: authenticatedRequest });
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
    cancelAttachmentWait();
    const controller = new AbortController(); request.current = controller; setAiTask("questions");
    const options = { signal: controller.signal, request: authenticatedRequest };
    setBusy(true); setNotice("");
    try {
      let recordId = draftId;
      if (!draftId) {
        const draft = await createProjectRecord(projectId, { aiOrganize: true, memo: memo.trim() || null, attachmentIds: attachments.map((a) => a.attachmentId) }, options);
        controller.signal.throwIfAborted();
        recordId = draft.recordId;
        setDraftId(draft.recordId);
      } else await updateProjectRecord(draftId, { memo: memo.trim(), attachmentIds: attachments.map((a) => a.attachmentId) }, options);
      const result = await getRecordQuestions(recordId, { ...options, mode });
      controller.signal.throwIfAborted();
      setQuestionState((current) => recordQuestionState(current, result.questions, attachments, { regenerate }));
      setConfirmRegenerate(null);
      const insufficient = result.insufficientMaterial || result.questions.length === 0;
      setInsufficientMaterial(insufficient);
      // 자료가 부족하면 기존처럼 직접 쓰기를 펼친다. 요청 잠금이 풀린 뒤 첫 칸에 포커스한다.
      if (insufficient) {
        focusDirectField.current = true;
        setIsWritingFields(true);
      }
      setStep(insufficient ? "materials" : "questions");
    } catch (error) {
      if (!controller.signal.aborted) {
        if (error.status === 409 && error.code === "MATERIAL_CHANGED") {
          setConfirmRegenerate({ answerCount: error.detail?.answeredCount ?? null });
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
    // 정리된 글이 보이지 않게 남아 있지 않도록, 내용이 있으면 5칸을 펼쳐 둔다.
    setIsWritingFields((current) => current || Object.values(fields).some((value) => value.trim()));
    setNotice("");
    setStep("materials");
  }

  function writeDirectly() {
    focusDirectField.current = true;
    setIsWritingFields(true);
    returnToMaterials();
  }

  return (
    <Card as="section" size="md" aria-labelledby="record-add-title">
      <fieldset disabled={busy} className="flex min-w-0 flex-col gap-4" aria-busy={busy}>
        <RecordFormTitle id="record-add-title">기록 추가</RecordFormTitle>
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
          <div className="flex flex-col items-start gap-4">
            <div className="w-full">
              <RecordAttachmentsField
                onBusyChange={setAttachmentBusy}
                label={
                  <>
                    자료 첨부 <span className="text-ink-subtle">· 선택 · 회의록, 발표 자료, 디자인 화면, 피그마 링크</span>
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
            <TextField
              label={
                <>
                  짧은 메모 <span className="text-ink-subtle">· 대충 써도 돼요</span>
                </>
              }
              multiline
              rows={2}
              placeholder="예) 11/3 기획 회의. 홈 화면 구성 논의. 나는 시안 2개 준비"
              value={memo}
              onChange={(event) => {
                setMemo(event.target.value);
                setConfirmRegenerate(null);
                cancelAttachmentWait();
                setNotice("");
              }}
            />
            <TextLink onClick={() => isWritingFields ? setIsWritingFields(false) : writeDirectly()}>
              {isWritingFields ? "직접 쓰기 접기" : "5칸 직접 채우기"}
            </TextLink>
            {isWritingFields && (
              <RecordFieldsGrid
                getFieldProps={({ key, formLabel, placeholder }, index) => ({
                  ...(index === 0 ? { ref: firstDirectField } : {}),
                  label: (
                    <>
                      {formLabel} <span className="text-ink-subtle">· 선택</span>
                    </>
                  ),
                  placeholder,
                  ...getFieldValueProps(key),
                })}
              />
            )}
            {confirmRegenerate && <div role="group" aria-label="자료 변경 확인" className="flex flex-wrap gap-2 rounded-xl bg-tint-yellow p-3">
              <p className="w-full text-body-sm">자료가 바뀌었어요. 질문을 새로 만들면 {confirmRegenerate.answerCount === null ? "이전 답은 지워져요." : `지금까지 쓴 답 ${confirmRegenerate.answerCount}개가 사라져요.`}</p>
              <Button size="sm" disabled={busy} onClick={() => { setConfirmRegenerate(null); cancelAttachmentWait(); }}>취소</Button>
              <Button size="sm" disabled={busy} onClick={() => continueAi("CONTINUE")}>이전 질문 이어 쓰기</Button>
              <Button size="sm" disabled={busy} onClick={() => continueAi("REGENERATE")}>질문 새로 만들기</Button>
            </div>}
            {waitingForAttachments && <div role="status" className="flex flex-wrap items-center gap-2 text-label text-ink-muted">
              <p>자료를 읽고 있어요. 잠시 후 질문을 시작해요.</p>
              <Button size="sm" variant="secondary" onClick={cancelAttachmentWait}>대기 취소</Button>
            </div>}
            <ActionFooter>
              <TextLink onClick={onCancel}>취소</TextLink>
              <div className="ml-auto flex flex-wrap gap-2">
                {isWritingFields && (
                  <Button variant="secondary" disabled={attachmentBusy} onClick={organizeDirectly}>이대로 정리 →</Button>
                )}
                <Button disabled={busy || attachmentBusy} onClick={startAiSummary}>{busy ? "기록 준비 중…" : "AI와 정리하기 →"}</Button>
              </div>
            </ActionFooter>
            {insufficientMaterial && (
              <BlankFieldsNotice>자료가 부족해요. 읽을 수 있는 자료가 없어서 질문을 만들지 못했어요. 5칸을 직접 채워 바로 기록하거나, 메모를 적거나 PDF·TXT로 다시 올려 주세요.</BlankFieldsNotice>
            )}
          </div>
        )}
        <AiWaitingNotice active={aiTask !== null} doing={aiTask === "organize" ? "답을 바탕으로 기록을 정리하고 있어요" : "자료를 읽고 질문을 만들고 있어요"} />
        {notice && <p role="alert" className="text-label text-tint-red-ink">{notice} {step === "questions" && <button type="button" onClick={showReview}>정리 다시 시도</button>}</p>}
      </fieldset>
      <Toast toast={toast} onDismiss={hideToast} />
    </Card>
  );
}
