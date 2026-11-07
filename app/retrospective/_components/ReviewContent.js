"use client";

import { useState } from "react";
import { useMockData } from "@/components/layout/MockDataProvider";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import { buildWeekStoryCard } from "@/lib/mock/retrospective";
import RetrospectiveSteps from "./RetrospectiveSteps";
import { useRetrospectivePreview } from "./RetrospectivePreview";

const STORY_FIELDS = [
  { name: "title", label: "제목" },
  { name: "situation", label: "상황", height: "h-[76px]" },
  { name: "action", label: "행동", height: "h-[172px]" },
  { name: "result", label: "결과", height: "h-[76px]" },
];

export default function ReviewContent({ initialDraft }) {
  const { setCompletedDraft, getStepHref, isAssignment } = useRetrospectivePreview();
  const { competencies, completeWeek } = useMockData();
  const [draft, setDraft] = useState(initialDraft);
  const [notice, setNotice] = useState("");

  function updateStory(name, value) {
    setDraft((previous) => ({ ...previous, story: { ...previous.story, [name]: value } }));
  }

  function toggleTag(tag) {
    const selected = draft.selectedTags.includes(tag);
    if (!selected && draft.selectedTags.length >= 3) {
      setNotice("역량 태그는 최대 3개까지 선택할 수 있어요. 선택한 태그를 먼저 빼 주세요.");
      return;
    }
    setDraft((previous) => ({
      ...previous,
      selectedTags: selected
        ? previous.selectedTags.filter((item) => item !== tag)
        : [...previous.selectedTags, tag],
    }));
    setNotice("");
  }

  async function copyRetrospective() {
    try {
      await navigator.clipboard.writeText(draft.retrospective);
      setNotice("회고록을 복사했어요. 노션에 붙여 넣어 주세요.");
    } catch {
      setNotice("복사하지 못했어요. 회고록의 내용을 직접 선택해서 복사해 주세요.");
    }
  }

  return (
    <>
      <RetrospectiveSteps currentStep={3} />
      <div className="mt-7 grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start gap-5">
        <Card as="section" size="md" className="flex min-w-0 flex-col gap-3" aria-labelledby="review-retrospective-title">
          <div className="flex items-center justify-between border-b border-ink pb-3">
            <h2 id="review-retrospective-title" className="text-[18px] tracking-[-0.01em]">노션용 회고록</h2>
            <Button size="sm" onClick={copyRetrospective}>회고록 복사</Button>
          </div>
          <p id="review-retrospective-help" className="text-label leading-[1.5] text-ink-subtle">
            고칠 곳은 바로 고쳐요. 복사하면 노션에 그대로 붙여 넣을 수 있어요.
          </p>
          <TextField
            multiline
            aria-label="노션용 회고록"
            aria-describedby="review-retrospective-help"
            name="retrospective"
            value={draft.retrospective}
            onChange={(event) => setDraft((previous) => ({ ...previous, retrospective: event.target.value }))}
            className="h-[560px] text-[14.5px] leading-[1.75]"
          />
        </Card>

        <Card as="section" size="md" className="flex min-w-0 flex-col gap-3" aria-labelledby="review-story-title">
          <div className="flex items-center justify-between border-b border-ink pb-3">
            <h2 id="review-story-title" className="text-[18px] tracking-[-0.01em]">스토리 카드 초안</h2>
            <ShapeCharacter shape="square" color="green" size={16} face="none" cropped />
          </div>
          {STORY_FIELDS.map(({ name, label, height }) => (
            <TextField
              key={name}
              label={label}
              name={name}
              multiline={name !== "title"}
              value={draft.story[name]}
              onChange={(event) => updateStory(name, event.target.value)}
              className={height ?? ""}
            />
          ))}
          <fieldset className="min-w-0">
            <legend className="mb-1.5 text-label text-ink-muted">
              역량 태그 <span className="text-ink-subtle">· AI가 정해진 역량 15개 중에서 골랐어요. 눌러서 빼거나 더할 수 있어요 (최대 3개)</span>
            </legend>
            <div className="flex flex-wrap">
              {competencies.map((tag) => (
                <Chip key={tag} size="sm" selected={draft.selectedTags.includes(tag)} onClick={() => toggleTag(tag)}>#{tag}</Chip>
              ))}
            </div>
          </fieldset>
          <div className="text-label text-ink-muted">
            <h3 className="mb-1.5">기록에서 확인한 근거</h3>
            <ul className="flex flex-col gap-1">
              {initialDraft.evidence.map((item) => (
                <li key={item} className="relative pl-3.5 before:absolute before:top-[8.44px] before:left-0 before:size-1.5 before:rounded-full before:bg-shape-green">{item}</li>
              ))}
            </ul>
          </div>
          <div className="pt-1">
            <div className="flex items-center gap-3.5 border-t border-line pt-4">
              <TextLink href={`${getStepHref("questions")}&preview=questions-complete`}>← 질문으로</TextLink>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setNotice("임시 저장은 준비 중이에요. 화면을 벗어나면 수정한 내용이 사라져요.")}>나중에 이어쓰기</Button>
                <Button variant="accent" href={getStepHref("complete")} onClick={() => {
                  setCompletedDraft(draft);
                  completeWeek(buildWeekStoryCard(draft, isAssignment));
                }}>저장하고 사자록에 추가</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <p role="status" className={notice ? "mt-3 text-body-sm text-ink-muted" : "sr-only"}>{notice}</p>
    </>
  );
}
