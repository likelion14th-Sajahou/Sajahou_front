"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TextLink from "@/components/ui/TextLink";
import EmptyFieldsNotice from "./EmptyFieldsNotice";
import RecordFieldsGrid from "./RecordFieldsGrid";
import RecordFormFooter from "./RecordFormFooter";
import RecordFormTitle from "./RecordFormTitle";
import { RECORD_FIELDS } from "./recordFields";
import SavedAttachments from "./SavedAttachments";

export default function ProjectRecordForm({ record, onCancel, onSave }) {
  const [fields, setFields] = useState(() =>
    Object.fromEntries(RECORD_FIELDS.map(({ key }) => [key, record[key] ?? ""])),
  );
  const [error, setError] = useState("");
  const { attachments } = record;

  function handleSubmit(event) {
    event.preventDefault();
    const changes = Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [key, value.trim()]),
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
        <RecordFormTitle id="record-form-title">기록 수정</RecordFormTitle>
        <p className="text-label leading-[19.5px] text-ink-subtle">고칠 칸을 바꾸고 저장하세요.</p>
        <EmptyFieldsNotice fields={fields} fieldKeys={["next"]} />
        <RecordFieldsGrid
          getFieldProps={({ key, formLabel }, index) => ({
            label: formLabel,
            value: fields[key],
            onChange: (event) => {
              setFields((current) => ({ ...current, [key]: event.target.value }));
              setError("");
            },
            autoFocus: index === 0,
          })}
        />
        <SavedAttachments attachments={attachments} />
        {error && <p role="alert" className="text-label text-tint-red-ink">{error}</p>}
        <RecordFormFooter>
          <TextLink onClick={onCancel}>취소</TextLink>
          <Button type="submit" className="ml-auto">고친 내용 저장</Button>
        </RecordFormFooter>
      </form>
    </Card>
  );
}
