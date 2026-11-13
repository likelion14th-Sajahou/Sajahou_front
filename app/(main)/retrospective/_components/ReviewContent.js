"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/AuthProvider";
import { useMockData } from "@/components/layout/MockDataProvider";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import BlankFieldsNotice from "@/components/ui/BlankFieldsNotice";
import DrawnBorder from "@/components/ui/DrawnBorder";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import Toast, { useToast } from "@/components/ui/Toast";
import CompetencyTagPicker, { EMPTY_TAGS_MESSAGE } from "@/components/my-record/CompetencyTagPicker";
import { getCompetencies, updateStoryCard } from "@/lib/myRecordApi";
import { completeRetrospective, createReviewDraft, getRetrospective } from "@/lib/retrospectiveApi";
import RetrospectiveSteps from "./RetrospectiveSteps";
import { useRetrospectivePreview } from "./RetrospectivePreview";
import { SavedTime, useSaveLater } from "./useSaveLater";
import { copyText } from "@/lib/clipboard";
import { selectedCompetencyNames } from "@/lib/competencySelection";
import RetroDarkCard from "./RetroDarkCard";
import { getAiErrorMessage, getRequestErrorMessage } from "@/lib/requestErrorMessage";

// API 19의 초안 값을 편집하고 API 23으로 저장하는 6개 필드다(R-20). 높이와 안내 문구는 11/13 디자인(프로토타입)을 따른다.
// blank: 칸이 비어 있을 때 그 칸 바로 아래에 띄우는 안내(⚑). 행동·결과·배운 점은 프로토타입 문구이고,
// 제목·상황·이유는 같은 말투로 새로 썼다. 칸을 채우면 안내는 바로 사라진다.
const STORY_FIELDS = [
  { name: "title", label: "제목", blank: "제목이 비어 있어요. 이 경험을 한 줄로 이름 붙여 주세요." },
  { name: "situation", label: "상황", height: "h-[72px]", blank: "상황은 기록에서 찾지 못해 비워 뒀어요. 어떤 상황이었는지 한 줄 남겨 주세요." },
  { name: "action", label: "행동", height: "h-[120px]", placeholder: "근거를 더 추가할 수 있어요", blank: "행동이 기록에 부족해요. 근거를 더 추가할 수 있어요." },
  { name: "reason", label: "이유", height: "h-[72px]", placeholder: "왜 그렇게 했는지 한 줄 남겨 주세요", blank: "이유는 기록에서 찾지 못해 비워 뒀어요. 왜 그렇게 했는지 한 줄 남겨 주세요." },
  { name: "result", label: "결과", height: "h-[72px]", placeholder: "근거를 더 추가할 수 있어요 · 기록에 없는 수치는 넣지 않았어요", blank: "결과나 수치는 기록에서 찾지 못해 비워 뒀어요. 근거를 더 추가할 수 있어요." },
  { name: "learned", label: "배운 점", height: "h-[72px]", placeholder: "다음에도 가져갈 한 가지를 남겨 주세요", blank: "느낀 점은 비워 뒀어요. 직접 한 줄 남겨 주세요." },
];

function ReviewForm({ retrospectiveId, initialCard, competencyItems }) {
  const router = useRouter();
  const { authenticatedRequest } = useAuth();
  const { getStepHref, refreshCurrent, isAssignment } = useRetrospectivePreview();
  const { setWeekStatus } = useMockData();
  const [fields, setFields] = useState(() => Object.fromEntries(STORY_FIELDS.map(({ name }) => [name, initialCard[name] ?? ""])));
  const [fullMarkdown, setFullMarkdown] = useState(initialCard.fullMarkdown ?? "");
  const [tagSelection, setSelectedTags] = useState(() => initialCard.competencies);
  const selectedTags = selectedCompetencyNames(tagSelection, competencyItems);
  const [notice, setNotice] = useState("");
  const { save, isSaving, savedLabel } = useSaveLater();
  const [isSavingCard, setIsSavingCard] = useState(false);
  const savingCardRef = useRef(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const cardChanges = () => ({
    ...fields,
    fullMarkdown,
    competencyIds: selectedTags.map((name) => competencyItems.find((item) => item.name === name)?.id).filter((id) => id !== undefined),
  });

  // 고친 회고록·카드와 고른 역량을 초안 카드에 저장한다(API 23). 실패하면 안내 문구를, 성공하면 ""를 돌려준다.
  async function saveCard() {
    if (savingCardRef.current) return null;
    savingCardRef.current = true;
    setIsSavingCard(true);
    try {
      await updateStoryCard(initialCard.cardId, cardChanges(), { request: authenticatedRequest });
      return "";
    } catch (failure) {
      return failure.status === 401 ? null : getRequestErrorMessage(failure, "초안을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      savingCardRef.current = false;
      setIsSavingCard(false);
    }
  }

  // 미저장 태그도 서버 초안에 남겨, 답 수정 후 API 19가 다시 만들어도 유지한다.
  async function backToQuestions() {
    if (isBusy) return;
    const message = await saveCard();
    if (message !== "") {
      if (message) setNotice(message);
      return;
    }
    router.push(getStepHref("questions"));
  }

  // 나중에 이어쓰기: 카드를 저장하고 지금 단계(4)와 저장 시각을 남긴다(API 14).
  async function saveLater() {
    if (initialCard.cardId) {
      const message = await saveCard();
      if (message !== "") {
        if (message) setNotice(message);
        return;
      }
    }
    const message = await save({ currentStep: 4 });
    if (message !== null) setNotice(message);
  }

  async function copyRetrospective() {
    const copied = await copyText(fullMarkdown);
    showToast(copied ? "회고록을 복사했어요. 노션에 붙여 넣어 주세요." : "복사하지 못했어요. 회고록의 내용을 직접 선택해서 복사해 주세요.");
  }

  // 저장하고 사자록에 추가(R-21): 고친 카드를 저장한 뒤 회고를 완료한다(API 23 → 20). 카드가 나의 사자록에 쌓이고 이번 주 스티커를 받는다.
  // 역량 태그는 1~3개를 골라야 한다(R-20).
  async function complete() {
    if (!selectedTags.length) {
      showToast(EMPTY_TAGS_MESSAGE);
      return;
    }
    const message = await saveCard();
    if (message !== "") {
      if (message) setNotice(message);
      return;
    }
    setIsCompleting(true);
    try {
      await completeRetrospective(retrospectiveId, { request: authenticatedRequest });
      await refreshCurrent();
      // 홈 화면은 아직 목업 상태를 보므로 세션 회고를 끝내면 함께 바꾼다. 홈 API(4번)를 연결하면 뺀다.
      if (!isAssignment) setWeekStatus("done");
      router.push(getStepHref("complete"));
    } catch (failure) {
      if (failure.code === "COMPETENCY_LIMIT") showToast(EMPTY_TAGS_MESSAGE);
      else if (failure.status !== 401) setNotice(getRequestErrorMessage(failure, "저장하지 못했어요. 잠시 후 다시 시도해 주세요."));
    } finally {
      setIsCompleting(false);
    }
  }

  const isBusy = isSaving || isSavingCard || isCompleting;

  return (
    <>
      {/* 왼쪽은 진한 '노션용 회고록' 카드, 오른쪽은 연회색 '스토리 카드 초안' 카드다(11/13 디자인, 568:496). */}
      <fieldset disabled={isBusy} aria-busy={isBusy} className="mt-10 grid min-w-0 grid-cols-[minmax(0,568fr)_minmax(0,496fr)] items-start gap-6">
        <RetroDarkCard border="materials-card" aria-labelledby="review-retrospective-title">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id="review-retrospective-title" className="font-display text-title leading-8 tracking-[-0.4px] text-white">노션용 회고록</h2>
              <p id="review-retrospective-help" className="mt-1 text-label leading-5 text-locked">
                고칠 곳은 바로 고쳐요. 복사하면 노션에 그대로 붙여 넣을 수 있어요.
              </p>
            </div>
            <Button variant="cta" className="shrink-0" onClick={copyRetrospective}>회고록 복사</Button>
          </div>
          {/* 회고록은 손그림 테두리의 흰 상자 안에 둔다(자료 화면의 흰 섹션과 같은 선). 고칠 수 있는 칸이라 글은 Pretendard다. */}
          <div className="relative rounded-[20px] bg-white p-1">
            <DrawnBorder variant="section-card" />
            <TextField
              multiline
              appearance="plain"
              aria-label="노션용 회고록"
              aria-describedby="review-retrospective-help"
              name="retrospective"
              value={fullMarkdown}
              onChange={(event) => setFullMarkdown(event.target.value)}
              className="block h-[900px] font-input leading-6 text-ink-strong!"
            />
          </div>
        </RetroDarkCard>

        <section aria-labelledby="review-story-title" className="relative flex min-w-0 flex-col gap-3.5 rounded-[28px] bg-divider p-6">
          <DrawnBorder variant="materials-card" />
          <h2 id="review-story-title" className="font-display text-title leading-8 tracking-[-0.4px] text-ink-strong">스토리 카드 초안</h2>
          {/* 기록에서 찾지 못한 칸은 지어내지 않고 비워 둔다(R-20). */}
          <div className="flex flex-col gap-4">
            {STORY_FIELDS.map(({ name, label, height, placeholder, blank }) => {
              // 비운 칸은 바로 안내가 생기고, 채우면 사라지도록 입력값으로 정한다.
              const isBlank = !fields[name].trim();
              return (
                <div key={name} className="flex flex-col gap-2">
                  <TextField
                    label={label}
                    labelClassName="text-label leading-5 text-ink-subtle"
                    appearance="outlined"
                    name={name}
                    multiline={name !== "title"}
                    value={fields[name]}
                    placeholder={placeholder}
                    onChange={(event) => setFields((previous) => ({ ...previous, [name]: event.target.value }))}
                    aria-describedby={isBlank ? `${name}-blank` : undefined}
                    className={`font-input leading-6 text-ink-strong! ${height ?? ""}`}
                  />
                  {isBlank && <BlankFieldsNotice id={`${name}-blank`}>{blank}</BlankFieldsNotice>}
                </div>
              );
            })}
            <CompetencyTagPicker
              id="review-tags-label"
              competencies={competencyItems}
              selectedTags={selectedTags}
              listClassName="gap-x-1.5 gap-y-2"
              labelClassName="text-ink-subtle"
              hintClassName="text-caption text-ink-faintest"
              chipClassName="font-display border-ink-300! aria-pressed:border-ink!"
              onChange={setSelectedTags}
              onLimit={showToast}
            />
            <div className="text-label leading-[20.8px]">
              <h3 className="mb-1.5 text-ink-subtle">기록에서 확인한 근거</h3>
              <ul className="flex flex-col gap-1 text-ink">
                {(initialCard.evidenceSummary ?? []).map((item) => (
                  <li key={item} className="relative pl-3.5 before:absolute before:top-[8.4px] before:left-0 before:size-1.5 before:rounded-full before:bg-tint-green-ink">{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3.5 gap-y-2.5 border-t border-[#d9d7d1] pt-4">
            {/* 모든 질문에 답했으면 질문 화면이 질문 끝(고치기 목록)으로 열린다(R-17). */}
            <TextLink onClick={backToQuestions} disabled={isBusy}>← 질문으로</TextLink>
            <div className="ml-auto flex gap-2">
              <Button variant="ink-outline" onClick={saveLater} disabled={isBusy} aria-busy={isBusy && !isCompleting}>{isBusy && !isCompleting ? "저장하는 중…" : "나중에 이어쓰기"}</Button>
              <Button variant="cta-ink" onClick={complete} disabled={isBusy} aria-busy={isCompleting}>{isCompleting ? "저장하는 중…" : "저장하고 사자록에 추가"}</Button>
            </div>
          </div>
          {/* 버튼 줄에 자리가 없어 바로 아래 오른쪽에 둔다. 저장 전에는 자리를 차지하지 않는다. */}
          <SavedTime label={savedLabel} className="-mt-1.5 self-end empty:hidden" />
        </section>
      </fieldset>
      <p role="status" className={notice ? "mt-3 text-body-sm text-ink-muted" : "sr-only"}>{notice}</p>
      <Toast toast={toast} onDismiss={hideToast} />
    </>
  );
}

// 4단계 검토. 저장된 초안 카드(API 13의 card)를 불러오고, 아직 없으면 그때 만든다(API 19).
// 역량 태그는 고정 목록(API 6)에서 고르고, 저장할 때 id로 보낸다.
export default function ReviewContent() {
  const router = useRouter();
  const { authenticatedRequest } = useAuth();
  const { user } = useMockData();
  const { retrospective, getStepHref } = useRetrospectivePreview();
  const retrospectiveId = retrospective?.id;
  const startHref = getStepHref();
  const [loaded, setLoaded] = useState(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!retrospectiveId) {
      router.replace(startHref);
      return;
    }
    const controller = new AbortController();
    const options = { signal: controller.signal, request: authenticatedRequest };
    async function load() {
      const competencyItems = await getCompetencies(options);
      let { card } = await getRetrospective(retrospectiveId, options);
      if (!card) {
        await createReviewDraft(retrospectiveId, options);
        ({ card } = await getRetrospective(retrospectiveId, options));
      }
      return { card, competencyItems };
    }
    load()
      .then(setLoaded)
      .catch((failure) => {
        if (controller.signal.aborted || failure.name === "AbortError" || failure.status === 401) return;
        setError(getAiErrorMessage(failure, "초안을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."));
      });
    return () => controller.abort();
    // 데모 파트를 바꾸면 그 파트의 역량 목록으로 다시 불러온다.
  }, [retrospectiveId, startHref, authenticatedRequest, router, reloadKey, user.part]);

  return (
    <>
      {/* 제목·단계·카드 사이 간격은 앞 단계 화면들과 같다(프로토타입 11/13). */}
      <RetrospectiveSteps currentStep={3} className="mt-[38px]" />
      {loaded ? (
        <ReviewForm key={`${loaded.card.cardId}:${user.part}`} retrospectiveId={retrospectiveId} initialCard={loaded.card} competencyItems={loaded.competencyItems} />
      ) : (
        <Card as="section" size="md" className="mt-10 flex flex-wrap items-center gap-3">
          {error ? (
            <>
              <p role="alert" className="text-body-sm text-error">{error}</p>
              <Button size="sm" variant="secondary" onClick={() => { setError(""); setReloadKey((key) => key + 1); }}>다시 시도</Button>
            </>
          ) : (
            <p role="status" className="text-body-sm text-ink-muted">회고록과 스토리 카드 초안을 불러오는 중이에요.</p>
          )}
        </Card>
      )}
    </>
  );
}
