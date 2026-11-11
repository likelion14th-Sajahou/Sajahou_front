"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/AuthProvider";
import { useMockData } from "@/components/layout/MockDataProvider";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import BlankFieldsNotice from "@/components/ui/BlankFieldsNotice";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
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
import CardTitle from "@/components/ui/CardTitle";
import ActionFooter from "@/components/ui/ActionFooter";
import { getAiErrorMessage, getRequestErrorMessage } from "@/lib/requestErrorMessage";

// 카드 초안에서 보여 주고 고치는 칸이다(R-20). 이유·배운 점은 카드에 있지만 이 화면에서는 고치지 않는다.
const STORY_FIELDS = [
  { name: "title", label: "제목" },
  { name: "situation", label: "상황", height: "h-[76px]" },
  { name: "action", label: "행동", height: "h-[172px]" },
  { name: "result", label: "결과", height: "h-[76px]" },
];

function ReviewForm({ retrospectiveId, initialCard, competencyItems }) {
  const router = useRouter();
  const { authenticatedRequest } = useAuth();
  const { getStepHref, refreshCurrent, isAssignment } = useRetrospectivePreview();
  const { setWeekStatus } = useMockData();
  const [fields, setFields] = useState(() => Object.fromEntries(STORY_FIELDS.map(({ name }) => [name, initialCard[name] ?? ""])));
  const [fullMarkdown, setFullMarkdown] = useState(initialCard.fullMarkdown ?? "");
  const [selectedTags, setSelectedTags] = useState(() => initialCard.competencies.map(({ name }) => name));
  const [notice, setNotice] = useState("");
  const { save, isSaving, savedLabel } = useSaveLater();
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  // 비운 칸은 바로 안내에서 빠지거나 생기도록 입력값으로 계산한다.
  const blankLabels = STORY_FIELDS.filter(({ name }) => name !== "title" && !fields[name].trim()).map(({ label }) => label);

  const cardChanges = () => ({
    ...fields,
    fullMarkdown,
    competencyIds: selectedTags.map((name) => competencyItems.find((item) => item.name === name)?.id).filter((id) => id !== undefined),
  });

  // 고친 회고록·카드와 고른 역량을 초안 카드에 저장한다(API 23). 실패하면 안내 문구를, 성공하면 ""를 돌려준다.
  async function saveCard() {
    setIsSavingCard(true);
    try {
      await updateStoryCard(initialCard.cardId, cardChanges(), { request: authenticatedRequest });
      return "";
    } catch (failure) {
      return failure.status === 401 ? null : getRequestErrorMessage(failure, "초안을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSavingCard(false);
    }
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
    setNotice(copied ? "회고록을 복사했어요. 노션에 붙여 넣어 주세요." : "복사하지 못했어요. 회고록의 내용을 직접 선택해서 복사해 주세요.");
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
      <div className="mt-7 grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start gap-5">
        <Card as="section" size="md" className="flex min-w-0 flex-col gap-3" aria-labelledby="review-retrospective-title">
          <CardTitle id="review-retrospective-title" action={<Button size="sm" onClick={copyRetrospective}>회고록 복사</Button>}>
            노션용 회고록
          </CardTitle>
          <p id="review-retrospective-help" className="text-label leading-[1.5] text-ink-subtle">
            고칠 곳은 바로 고쳐요. 복사하면 노션에 그대로 붙여 넣을 수 있어요.
          </p>
          <TextField
            multiline
            aria-label="노션용 회고록"
            aria-describedby="review-retrospective-help"
            name="retrospective"
            value={fullMarkdown}
            onChange={(event) => setFullMarkdown(event.target.value)}
            className="h-[560px] text-[14.5px] leading-[1.75]"
          />
        </Card>

        <Card as="section" size="md" className="flex min-w-0 flex-col gap-3" aria-labelledby="review-story-title">
          <CardTitle id="review-story-title" action={<ShapeCharacter shape="square" color="green" size={16} face="none" cropped />}>
            스토리 카드 초안
          </CardTitle>
          {/* 기록에서 찾지 못한 칸은 지어내지 않고 비워 둔다(R-20). */}
          <BlankFieldsNotice labels={blankLabels} />
          {STORY_FIELDS.map(({ name, label, height }) => (
            <TextField
              key={name}
              label={label}
              name={name}
              multiline={name !== "title"}
              value={fields[name]}
              onChange={(event) => setFields((previous) => ({ ...previous, [name]: event.target.value }))}
              className={height ?? ""}
            />
          ))}
          <CompetencyTagPicker
            id="review-tags-label"
            competencies={competencyItems}
            selectedTags={selectedTags}
            listClassName=""
            onChange={setSelectedTags}
            onLimit={showToast}
          />
          <div className="text-label text-ink-muted">
            <h3 className="mb-1.5">기록에서 확인한 근거</h3>
            <ul className="flex flex-col gap-1">
              {(initialCard.evidenceSummary ?? []).map((item) => (
                <li key={item} className="relative pl-3.5 before:absolute before:top-[8.44px] before:left-0 before:size-1.5 before:rounded-full before:bg-shape-green">{item}</li>
              ))}
            </ul>
          </div>
          <ActionFooter>
            {/* 모든 질문에 답했으면 질문 화면이 질문 끝(고치기 목록)으로 열린다(R-17). */}
            <TextLink href={getStepHref("questions")}>← 질문으로</TextLink>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={saveLater} disabled={isBusy} aria-busy={isBusy && !isCompleting}>{isBusy && !isCompleting ? "저장하는 중…" : "나중에 이어쓰기"}</Button>
              <Button variant="accent" onClick={complete} disabled={isBusy} aria-busy={isCompleting}>{isCompleting ? "저장하는 중…" : "저장하고 사자록에 추가"}</Button>
            </div>
          </ActionFooter>
          {/* 버튼 줄에 자리가 없어 바로 아래 오른쪽에 둔다. 저장 전에는 자리를 차지하지 않는다. */}
          <SavedTime label={savedLabel} className="-mt-2 self-end empty:hidden" />
        </Card>
      </div>
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
      <RetrospectiveSteps currentStep={3} />
      {loaded ? (
        <ReviewForm key={`${loaded.card.cardId}:${user.part}`} retrospectiveId={retrospectiveId} initialCard={loaded.card} competencyItems={loaded.competencyItems} />
      ) : (
        <Card as="section" size="md" className="mt-7 flex flex-wrap items-center gap-3">
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
