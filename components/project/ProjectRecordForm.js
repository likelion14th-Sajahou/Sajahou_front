"use client";

import { useState } from "react";
import { useMockData } from "@/components/layout/MockDataProvider";
import CompetencyTagPicker, { EMPTY_TAGS_MESSAGE } from "@/components/my-record/CompetencyTagPicker";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TextLink from "@/components/ui/TextLink";
import Toast, { useToast } from "@/components/ui/Toast";
import EmptyFieldsNotice from "./EmptyFieldsNotice";
import RecordFieldsGrid from "./RecordFieldsGrid";
import RecordFormFooter from "./RecordFormFooter";
import RecordFormTitle from "./RecordFormTitle";
import { EMPTY_RECORD_MESSAGE, RECORD_FIELDS } from "./recordFields";
import SavedAttachments from "./SavedAttachments";

// 기록 수정(H-15, 12-b). 저장하면 카드도 함께 바뀐다(카드 제목은 유지).
export default function ProjectRecordForm({ record, onCancel, onSave }) {
  const { competencies } = useMockData();
  const [fields, setFields] = useState(() =>
    Object.fromEntries(RECORD_FIELDS.map(({ key }) => [key, record[key] ?? ""])),
  );
  // 지금 파트 목록에 없는 태그(데모에서 파트를 바꿔 본 경우)는 빼고 시작한다. 카드 수정과 같은 규칙이다.
  const [tags, setTags] = useState(() => record.tags.filter((tag) => competencies.includes(tag)));
  const { toast, showToast, hideToast } = useToast();
  const { attachments } = record;

  function handleSubmit(event) {
    event.preventDefault();
    const changes = Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [key, value.trim()]),
    );

    // 5칸과 첨부가 모두 비어 있거나 역량 태그가 없으면 기록 추가와 같이 저장하지 않는다(H-14).
    if (attachments.length === 0 && !Object.values(changes).some(Boolean)) {
      showToast(EMPTY_RECORD_MESSAGE);
      return;
    }

    if (tags.length === 0) {
      showToast(EMPTY_TAGS_MESSAGE);
      return;
    }

    onSave({ ...changes, tags });
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
            onChange: (event) =>
              setFields((current) => ({ ...current, [key]: event.target.value })),
            autoFocus: index === 0,
          })}
        />
        <p className="text-label leading-[19.5px] text-ink-subtle">
          저장하면 이 기록이 나의 사자록에 프로젝트 카드로 쌓여요.
        </p>
        <CompetencyTagPicker
          id="record-edit-tags-label"
          competencies={competencies}
          selectedTags={tags}
          onChange={setTags}
          onLimit={showToast}
        />
        <SavedAttachments attachments={attachments} />
        <RecordFormFooter>
          <TextLink onClick={onCancel}>취소</TextLink>
          <Button type="submit" className="ml-auto">고친 내용 저장</Button>
        </RecordFormFooter>
      </form>
      <Toast toast={toast} onDismiss={hideToast} />
    </Card>
  );
}
