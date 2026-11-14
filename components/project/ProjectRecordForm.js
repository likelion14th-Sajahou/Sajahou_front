"use client";

import { useState } from "react";
import { useMockData } from "@/components/layout/MockDataProvider";
import CompetencyTagPicker, { EMPTY_TAGS_MESSAGE } from "@/components/my-record/CompetencyTagPicker";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DrawnBorder from "@/components/ui/DrawnBorder";
import TextLink from "@/components/ui/TextLink";
import Toast, { useToast } from "@/components/ui/Toast";
import EmptyFieldsNotice from "./EmptyFieldsNotice";
import RecordFieldsGrid from "./RecordFieldsGrid";
import RecordFormTitle from "./RecordFormTitle";
import { REVIEW_TAG_PICKER_STYLE } from "./ProjectRecordReview";
import { formatMonthDay } from "@/lib/formatDate";
import { EMPTY_RECORD_MESSAGE, RECORD_FIELDS } from "./recordFields";
import SavedAttachments from "./SavedAttachments";
import ActionFooter from "@/components/ui/ActionFooter";
import useProjectAction from "./useProjectAction";

// 기록 수정(H-15, 12-b). 저장하면 카드도 함께 바뀐다(카드 제목은 유지).
// 11/13 디자인: 기록 추가의 정리 결과와 같은 모양에 회색 손그림 테두리 상자.
export default function ProjectRecordForm({ record, onCancel, onSave }) {
  const { projectData } = useMockData();
  const competencies = projectData.competencyItems.map((item) => item.name);
  const { run, busy, error } = useProjectAction();
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

    run((signal) => onSave({ ...changes, tags }, signal));
  }

  return (
    <Card as="section" size="md" className="relative" aria-labelledby="record-form-title">
      <DrawnBorder variant="start-card" color="var(--color-ink-300)" />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <fieldset disabled={busy} className="flex min-w-0 flex-col gap-4">
        <RecordFormTitle id="record-form-title" date={`${formatMonthDay(record.date)}(${record.weekday})`}>기록 수정</RecordFormTitle>
        <p className="text-label leading-5 text-ink-subtle">고칠 칸을 바꾸고 저장하세요.</p>
        <EmptyFieldsNotice fields={fields} />
        <RecordFieldsGrid
          getFieldProps={({ key, formLabel }, index) => ({
            label: formLabel,
            value: fields[key],
            onChange: (event) =>
              setFields((current) => ({ ...current, [key]: event.target.value })),
            autoFocus: index === 0,
            // 저장된 글이 잘리지 않도록 내용 길이에 맞춰 칸이 늘어난다.
            className: "min-h-12 field-sizing-content",
          })}
        />
        <p className="text-label leading-5 text-ink-subtle">
          저장하면 이 기록이 나의 사자록에 프로젝트 카드로 쌓여요.
        </p>
        <CompetencyTagPicker
          id="record-edit-tags-label"
          competencies={projectData.competencyItems}
          selectedTags={tags}
          onChange={setTags}
          onLimit={showToast}
          {...REVIEW_TAG_PICKER_STYLE}
        />
        <SavedAttachments attachments={attachments} />
        <ActionFooter>
          <TextLink onClick={onCancel}>취소</TextLink>
          <Button type="submit" variant="ink" className="ml-auto">고친 내용 저장</Button>
        </ActionFooter>
        {error && <p role="alert">{error}</p>}
        </fieldset>
      </form>
      <Toast toast={toast} onDismiss={hideToast} />
    </Card>
  );
}
