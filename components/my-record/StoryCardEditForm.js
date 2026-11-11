"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import Toast, { useToast } from "@/components/ui/Toast";
import CompetencyTagPicker, { EMPTY_TAGS_MESSAGE } from "./CompetencyTagPicker";
import { RECORD_TEXT, SUMMARY_FIELDS } from "./storyCardTypes";

// competencies는 역량 목록 조회(API 6) 응답이다.
export default function StoryCardEditForm({ card, competencies, onCancel, onSave }) {
  const names = competencies.map(({ name }) => name);
  // 지금 파트 목록에 없는 태그(데모에서 파트를 바꿔 본 경우)는 빼고 시작한다.
  const [selectedTags, setSelectedTags] = useState(() =>
    card.tags.filter((tag) => names.includes(tag)),
  );
  const { toast, showToast, hideToast } = useToast();

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title").trim();

    if (!title) {
      return;
    }

    if (!selectedTags.length) {
      showToast(EMPTY_TAGS_MESSAGE);
      return;
    }

    onSave({
      title,
      tags: names.filter((tag) => selectedTags.includes(tag)),
      summary: Object.fromEntries(
        SUMMARY_FIELDS.map(({ key }) => [key, formData.get(key).trim()]),
      ),
      document: formData.get("document"),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <p className="text-label text-accent-strong">카드 수정</p>
      <TextField label="제목" name="title" defaultValue={card.title} required autoFocus />
      <CompetencyTagPicker
        id="edit-tags-label"
        competencies={competencies}
        selectedTags={selectedTags}
        onChange={setSelectedTags}
        onLimit={showToast}
      />
      {SUMMARY_FIELDS.map(({ key, label }) => (
        <TextField
          key={key}
          label={label}
          name={key}
          multiline
          rows={2}
          defaultValue={card.summary[key]}
        />
      ))}
      {/* Markdown 원문이라 고정폭 글꼴과 작은 글자로 보여 준다. */}
      <TextField
        label={
          <>
            {card.type === "project" ? RECORD_TEXT.title : "회고록 전문"}{" "}
            <span className="text-ink-subtle">· 노션에 붙여 넣는 글</span>
          </>
        }
        multiline
        name="document"
        defaultValue={card.document}
        className="h-[234px] font-mono text-label! leading-[20.8px]"
      />
      <div className="flex items-center justify-between gap-3.5 pt-1">
        <TextLink onClick={onCancel}>취소</TextLink>
        <Button type="submit">저장</Button>
      </div>
      <Toast toast={toast} onDismiss={hideToast} />
    </form>
  );
}
