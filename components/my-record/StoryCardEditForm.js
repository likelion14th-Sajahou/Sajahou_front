"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import CompetencyTagPicker from "./CompetencyTagPicker";
import { SUMMARY_FIELDS } from "./storyCardTypes";

export default function StoryCardEditForm({ card, competencies, onCancel, onSave }) {
  const [selectedTags, setSelectedTags] = useState(card.tags);

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title").trim();

    if (!title) {
      return;
    }

    onSave({
      title,
      tags: competencies.filter((tag) => selectedTags.includes(tag)),
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
      <label className="flex flex-col gap-1.5">
        <span className="text-label text-ink-muted">
          {card.type === "project" ? "포트폴리오 전문" : "회고록 전문"}{" "}
          <span className="text-ink-subtle">· 노션에 붙여 넣는 글</span>
        </span>
        <textarea
          name="document"
          defaultValue={card.document}
          className="h-[234px] w-full resize-none rounded-[14px] border border-transparent bg-canvas px-4 py-3 font-mono text-label leading-[20.8px] text-ink"
        />
      </label>
      <div className="flex items-center justify-between gap-3.5 pt-1">
        <TextLink onClick={onCancel}>취소</TextLink>
        <Button type="submit">저장</Button>
      </div>
    </form>
  );
}
