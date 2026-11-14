"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DrawnBorder from "@/components/ui/DrawnBorder";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import Toast, { useToast } from "@/components/ui/Toast";
import ActionFooter from "@/components/ui/ActionFooter";
import { createJobPosting } from "@/lib/matchingApi";
import { MATCHING_SAMPLE } from "@/lib/mock/matching";
import { ATTACHMENT_PENDING_MESSAGE, getAiErrorMessage } from "@/lib/requestErrorMessage";
import MatchingAttachments, { UNREADABLE_LINK_MESSAGE } from "./MatchingAttachments";
import MatchingResults from "./MatchingResults";
import useAnswerDrafts from "./useAnswerDrafts";
import useJobPostingAttachments from "./useJobPostingAttachments";
import useJobPostingRestore from "./useJobPostingRestore";
import AiWaitingNotice from "@/components/ui/AiWaitingNotice";

const EMPTY_FORM = { company: "", role: "", jd: "", preferences: "", companyInfo: "" };
const EMPTY_POSTING_MESSAGE = "공고 내용을 붙여 넣거나 파일을 올려 주세요.";

const optionalText = (value) => value.trim() || null;

// 문항의 화면용 id와 첨부 읽기 상태는 제외하고, 사용자가 수정하는 자료만 비교한다.
function formSnapshot(fields, questions, attachments) {
  return JSON.stringify({
    fields,
    questions: questions.map(({ text }) => text),
    attachmentIds: attachments.map(({ attachmentId }) => attachmentId).sort(),
  });
}

// 공고 저장·역량 찾기(36번) 요청을 만든다.
// 시안에는 공고 본문을 붙여 넣는 칸이 JD 칸 하나라 postingText는 null로 보낸다.
// 문항 글자 수 제한 입력(P1)은 시안에 없어 charLimit도 null로 보낸다.
function toJobPostingRequest(fields, questionTexts, attachmentIds) {
  return {
    company: optionalText(fields.company),
    department: optionalText(fields.role),
    postingText: null,
    jd: optionalText(fields.jd),
    preferredQualification: optionalText(fields.preferences),
    companyInfo: optionalText(fields.companyInfo),
    attachmentIds,
    questions: questionTexts.map((content) => ({ content, charLimit: null })),
  };
}

// 저장된 매칭 결과(39번)를 입력칸 값으로 되돌린다. 이 화면은 postingText를 보내지 않아(늘 null) 따로 채우지 않는다.
function toFormFields(saved) {
  return {
    company: saved.company ?? "",
    role: saved.department ?? "",
    jd: saved.jd ?? "",
    preferences: saved.preferredQualification ?? "",
    companyInfo: saved.companyInfo ?? "",
  };
}

// 찾기에 성공하면 주소에 공고 id를 남겨, 새로고침하거나 링크로 들어와도 결과를 다시 불러올 수 있게 한다(이슈 #42).
// 이 화면의 상태는 그대로 두고 주소만 바꾼다.
function keepJobPostingIdInAddress(jobPostingId) {
  const url = new URL(window.location.href);
  url.searchParams.set("jobPostingId", jobPostingId);
  window.history.replaceState(null, "", url);
}

// jobPostingId: 주소에 남은 공고 id다. 있으면 그 매칭 결과(39번)를 불러와 입력칸과 결과를 채운다.
export default function MatchingForm({ jobPostingId = null }) {
  const { authenticatedRequest } = useAuth();
  const [fields, setFields] = useState(EMPTY_FORM);
  const [questions, setQuestions] = useState([{ id: "initial", text: "" }]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  // 공고 저장·역량 찾기(36번) 응답과 회사 이름이다. 결과 화면이 이 값으로 그려진다.
  const [posting, setPosting] = useState(null);
  const [matchedSnapshot, setMatchedSnapshot] = useState(null);
  const [editedAnswerCount, setEditedAnswerCount] = useState(0);
  const [confirmSearch, setConfirmSearch] = useState(false);
  const [dismissedConfirmation, setDismissedConfirmation] = useState(null);
  const formRef = useRef(null);
  const searchButtonRef = useRef(null);
  const questionRefs = useRef(new Map());
  const controllerRef = useRef(null);
  // 링크 본문을 못 읽었다는 안내가 뜨면 JD 칸으로 커서를 옮긴다(M-02).
  const focusJd = () => formRef.current?.elements.namedItem("jd")?.focus();
  const attachments = useJobPostingAttachments();
  const answerDrafts = useAnswerDrafts();
  const restored = useJobPostingRestore(jobPostingId, (saved) => {
    const savedQuestions = [...saved.questions].sort((a, b) => a.seq - b.seq);
    const savedFields = toFormFields(saved);
    const restoredQuestions = savedQuestions.map(({ questionId, content }) => ({ id: `saved-${questionId}`, text: content }));
    setFields(savedFields);
    setQuestions(restoredQuestions);
    setMatchedSnapshot(formSnapshot(savedFields, restoredQuestions, saved.attachments));
    attachments.restore(saved.attachments);
    answerDrafts.restore(savedQuestions);
    setPosting({
      jobPostingId: saved.jobPostingId,
      company: saved.company,
      competencies: saved.competencies,
      noCompetencyFound: saved.competencies.length === 0,
      questions: savedQuestions,
    });
    setNotice("저장된 매칭 결과를 불러왔어요.");
  });
  const currentSnapshot = formSnapshot(fields, questions, attachments.items);
  const canSearch = matchedSnapshot === null || currentSnapshot !== matchedSnapshot;
  // 직접 고친 답이 있고 지원 자료가 달라지면, 재검색을 누르기 전부터 안내한다.
  // 취소한 자료에서는 안내를 닫고, 자료를 다시 수정하거나 찾기를 누르면 다시 연다.
  const showSearchConfirmation = canSearch && editedAnswerCount > 0 && !isSearching
    && (confirmSearch || dismissedConfirmation !== currentSnapshot);

  // 역량을 찾는 중에 화면을 떠나면 요청을 취소한다.
  useEffect(() => () => controllerRef.current?.abort(), []);

  function updateField(key, value) {
    setFields((previous) => ({ ...previous, [key]: value }));
    setNotice("");
  }

  // 예시 공고 넣기(M-05, 시연용): 회사·직무·공고 글·문항만 채운다. 첨부는 실제로 올린 것만 요청에 담기므로 건드리지 않는다.
  function loadSample() {
    const { questions: sampleQuestions, ...sampleFields } = MATCHING_SAMPLE;
    setFields({ ...sampleFields });
    setQuestions(sampleQuestions.map((text) => ({ id: crypto.randomUUID(), text })));
    setError("");
    setNotice("예시 공고와 문항을 넣었어요. 원하는 내용으로 수정할 수 있어요.");
  }

  // 공고 내용이 없어서 실행하지 못할 때의 안내다. 읽지 못한 링크만 있으면 그 링크 안내를 보여 준다(M-02).
  function showEmptyPosting() {
    const hasUnreadableLink = attachments.items.some(({ type, extractStatus }) => type === "LINK" && extractStatus === "FAILED");
    showToast(hasUnreadableLink ? UNREADABLE_LINK_MESSAGE : EMPTY_POSTING_MESSAGE);
    focusJd();
  }

  // 내 사자록에서 찾기(M-05): 입력을 확인한 뒤 공고 저장·역량 찾기(36번)를 부른다.
  async function submit(event, confirmed = false) {
    event?.preventDefault();
    if (confirmed) setConfirmSearch(false);
    // 저장된 결과를 불러오는 중에는 찾지 않는다. 늦게 온 결과가 새로 찾은 결과를 덮지 않게 한다.
    if (isSearching || attachments.isBusy || restored.isRestoring || !canSearch) return;
    setError("");
    // 실행하지 못하는 이유는 눈에 보이게 토스트로 안내하고, 고칠 칸으로 커서를 옮긴다(M-05, M-02).
    const questionTexts = questions.map(({ text }) => text.trim()).filter(Boolean);
    if (!questionTexts.length) {
      showToast("자소서 문항을 하나 이상 넣어 주세요");
      questionRefs.current.get(questions[0].id)?.focus();
      return;
    }
    if (attachments.items.some(({ extractStatus }) => extractStatus === "PENDING")) {
      showToast(ATTACHMENT_PENDING_MESSAGE);
      return;
    }
    // 본문을 읽은 첨부(DONE)만 공고 내용으로 친다.
    const hasPostingText = [fields.jd, fields.preferences, fields.companyInfo].some((text) => text.trim());
    if (!hasPostingText && !attachments.items.some(({ extractStatus }) => extractStatus === "DONE")) {
      showEmptyPosting();
      return;
    }
    if (editedAnswerCount > 0 && !confirmed) {
      setConfirmSearch(true);
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setIsSearching(true);
    try {
      const request = toJobPostingRequest(fields, questionTexts, attachments.items.map(({ attachmentId }) => attachmentId));
      const created = await createJobPosting(request, { signal: controller.signal, request: authenticatedRequest });
      setPosting({ ...created, company: request.company });
      setEditedAnswerCount(0);
      setDismissedConfirmation(null);
      // 요청을 보낸 시점의 자료를 남겨, 응답을 기다리며 고친 내용도 다시 찾을 수 있게 한다.
      setMatchedSnapshot(currentSnapshot);
      restored.markHandled(created.jobPostingId);
      keepJobPostingIdInAddress(created.jobPostingId);
      // 역량을 찾으면 바로 모든 문항의 답 초안을 만든다(M-08).
      answerDrafts.start(created.questions.map(({ questionId }) => questionId));
      setNotice("공고가 원하는 역량을 찾았어요. 문항별 답 초안을 만들고 있어요.");
    } catch (failure) {
      if (controller.signal.aborted || failure.status === 401) return;
      if (failure.code === "EMPTY_MATERIAL") showEmptyPosting();
      else if (failure.code === "ATTACHMENT_PENDING") showToast(ATTACHMENT_PENDING_MESSAGE);
      else setError(getAiErrorMessage(failure, failure.code === "VALIDATION_ERROR" ? "입력한 내용을 확인해 주세요." : "내 사자록에서 찾지 못했어요. 잠시 후 다시 시도해 주세요."));
    } finally {
      setIsSearching(false);
    }
  }

  function field(key, label, placeholder, rows) {
    return <TextField label={label} name={key} value={fields[key]} placeholder={placeholder} onChange={(event) => updateField(key, event.target.value)} multiline={Boolean(rows)} rows={rows} />;
  }

  return (
    <>
    <Card as="form" size="md" className="matching-form relative mt-7 flex min-w-0 flex-col gap-4 rounded-[24px]! px-5! sm:px-7!" aria-labelledby="matching-form-title" onSubmit={submit} ref={formRef}>
      <DrawnBorder variant="thin-outline" repeat="round" color="var(--color-ink-300)" />
      <div>
        <h2 id="matching-form-title" className="text-heading leading-[35.2px] tracking-[-0.44px]">지원할 곳 알려 주기</h2>
        <p className="text-label leading-[1.5] text-ink-subtle">공고와 문항을 넣으면 내 사자록에서 쓸 만한 경험을 골라요.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {field("company", "회사", "예) 모아핀테크")}
        {field("role", "직무·부서", "예) 서비스 기획 인턴")}
      </div>
      <MatchingAttachments attachments={attachments} onLinkUnreadable={focusJd} />
      {field("jd", "주요 업무·자격 요건 (JD)", "공고 본문을 붙여 넣어요", 4)}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {field("preferences", <>채용 부서 우대사항 <span className="text-ink-faintest">· 선택</span></>, "예) 데이터로 디자인 결정을 설명할 수 있는 분", 3)}
        {field("companyInfo", <>기업 정보·인재상 <span className="text-ink-faintest">· 선택</span></>, "예) 사용자 곁에서 생각하는 사람", 3)}
      </div>
      <fieldset className="flex min-w-0 flex-col gap-1.5">
        <legend className="mb-1.5 text-label text-ink-muted">자소서 문항</legend>
        <div className="flex flex-col gap-2">
          {questions.map((question, index) => (
            <div key={question.id} className="flex min-w-0 items-start gap-2">
              <span aria-hidden="true" className="mt-2.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-label text-ink-950">{index + 1}</span>
              <TextField multiline rows={2} name={`question-${question.id}`} aria-label={`문항 ${index + 1}`} placeholder="예) 협업 과정에서 의견을 조율한 경험" value={question.text} ref={(element) => { if (element) questionRefs.current.set(question.id, element); else questionRefs.current.delete(question.id); }} onChange={(event) => { setQuestions((previous) => previous.map((item) => item.id === question.id ? { ...item, text: event.target.value } : item)); setNotice(""); }} />
              {questions.length > 1 && <TextLink size="sm" aria-label={`문항 ${index + 1} 빼기`} onClick={() => { const next = questions.filter(({ id }) => id !== question.id); setQuestions(next); questionRefs.current.get(next[Math.min(index, next.length - 1)].id)?.focus(); }}>빼기</TextLink>}
            </div>
          ))}
          <TextLink className="self-start" onClick={() => {
            const id = crypto.randomUUID();
            setQuestions((previous) => [...previous, { id, text: "" }]);
            requestAnimationFrame(() => questionRefs.current.get(id)?.focus());
          }}>+ 문항 추가</TextLink>
        </div>
      </fieldset>
      <ActionFooter className="justify-between gap-3.5">
        <TextLink onClick={loadSample}>예시 공고 넣기</TextLink>
        {/* 첨부를 올리는 중에는 아직 목록에 없는 첨부가 빠지지 않도록 기다린다. */}
        <Button ref={searchButtonRef} type="submit" variant="cta" borderColor="var(--color-ink)" className="matching-search max-w-full disabled:bg-canvas! disabled:text-ink-300!" disabled={!canSearch || isSearching || attachments.isBusy || restored.isRestoring} aria-busy={isSearching}>
          {isSearching ? "내 사자록에서 찾는 중…" : !canSearch ? "찾기 완료 ✓" : posting ? "바뀐 내용으로 다시 찾기 →" : "내 사자록에서 찾기 →"}
        </Button>
      </ActionFooter>
      {showSearchConfirmation && (
        <div role="group" aria-label="다시 찾기 확인" className="flex flex-wrap items-center justify-end gap-x-4 gap-y-3">
          <p role="status" className="text-body-sm font-display text-ink">
            다시 찾으면 직접 고친 답 {editedAnswerCount}개가 새 초안으로 바뀌어요.
          </p>
          <TextLink onClick={() => { setConfirmSearch(false); setDismissedConfirmation(currentSnapshot); searchButtonRef.current?.focus(); }}>취소</TextLink>
          <Button variant="ink" disabled={attachments.isBusy || restored.isRestoring} onClick={() => submit(null, true)}>다시 찾기</Button>
        </div>
      )}
      <AiWaitingNotice active={isSearching} doing="공고를 읽고 내 사자록에서 맞는 역량을 찾고 있어요" className="-mt-2 text-right" />
      {error && <p role="alert" className="-mt-2 text-right text-body-sm text-error">{error}</p>}
      <p role="status" className="sr-only">{notice}</p>
      <Toast toast={toast} onDismiss={hideToast} />
    </Card>
    {/* 주소에 남은 공고의 매칭 결과(39번)를 불러오는 중·실패 안내 */}
    {restored.isRestoring && <p role="status" className="pt-10 text-body-sm text-ink-muted">저장된 매칭 결과를 불러오는 중이에요.</p>}
    {restored.error && (
      <div className="flex flex-wrap items-center gap-3 pt-10">
        <p role="alert" className="text-body-sm text-error">{restored.error}</p>
        {restored.canRetry && <Button size="sm" variant="secondary" onClick={restored.retry}>다시 불러오기</Button>}
      </div>
    )}
    {/* 새로 찾으면 직접 고친 답도 함께 비우도록 공고마다 새로 그린다. */}
    {posting && (
      <MatchingResults
        key={posting.jobPostingId}
        posting={posting}
        drafts={answerDrafts.drafts}
        onRetry={answerDrafts.retry}
        onEditedCountChange={setEditedAnswerCount}
      />
    )}
    </>
  );
}
