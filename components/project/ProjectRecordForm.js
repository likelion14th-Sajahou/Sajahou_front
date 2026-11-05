"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import { MOCK_TODAY_LABEL } from "@/lib/mock/projects";
import AttachmentChip from "./AttachmentChip";
import { RECORD_FIELDS } from "./recordFields";

export default function ProjectRecordForm({ record, onCancel, onSave }) {
  const [error, setError] = useState("");
  const { attachments } = record;

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const changes = Object.fromEntries(
      RECORD_FIELDS.map(({ key }) => [key, formData.get(key).trim()]),
    );

    // 5칸과 첨부가 모두 비어 있으면 저장하지 않는다(H-14).
    if (attachments.length === 0 && !Object.values(changes).some(Boolean)) {
      setError("기록할 내용을 한 칸 이상 적어 주세요.");
      return;
    }

    onSave(changes);
  }

  return (
    <Card as="section" size="md" aria-labelledby="record-form-title">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="pb-4">
          <div className="flex items-center justify-between border-b border-ink pb-3">
            <h2 id="record-form-title" className="text-[18px] tracking-[-0.18px] text-ink">기록 수정</h2>
            <p className="text-label leading-[19.5px] text-ink-subtle">오늘 · {MOCK_TODAY_LABEL}</p>
          </div>
        </div>
        <p className="text-label leading-[19.5px] text-ink-subtle">고칠 칸을 바꾸고 저장하세요.</p>
        <div className="grid grid-cols-2 gap-3">
          {RECORD_FIELDS.map(({ key, formLabel }, index) => (
            <div key={key} className={index === 0 ? "col-span-2" : ""}>
              <TextField
                label={formLabel}
                name={key}
                multiline
                rows={2}
                defaultValue={record[key]}
                autoFocus={index === 0}
                className="h-[76px]"
              />
            </div>
          ))}
        </div>
        {attachments.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-label text-ink-muted">함께 저장되는 자료</p>
            <ul className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <AttachmentChip key={attachment.id} attachment={attachment} />
              ))}
            </ul>
          </div>
        )}
        {error && <p role="alert" className="text-label text-tint-red-ink">{error}</p>}
        <div className="pt-1">
          <div className="flex items-center justify-between gap-3.5 border-t border-line pt-4">
            <TextLink onClick={onCancel}>취소</TextLink>
            <Button type="submit">고친 내용 저장</Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
