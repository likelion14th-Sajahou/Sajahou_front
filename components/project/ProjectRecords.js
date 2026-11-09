"use client";

import { useState } from "react";
import CompetencyTags from "@/components/my-record/CompetencyTags";
import AttachmentChip from "@/components/ui/AttachmentChip";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import TextLink from "@/components/ui/TextLink";
import DeleteConfirm from "./DeleteConfirm";
import ProjectRecordAddForm from "./ProjectRecordAddForm";
import ProjectRecordForm from "./ProjectRecordForm";
import { RECORD_FIELDS } from "./recordFields";

// 완료한 프로젝트에는 별도 안내 문구가 없다(H-21, 12-a).
const ADD_RECORD_HINT = "회의록·시안·링크를 올리면 AI가 정리를 도와요";

function RecordItem({ record, isLast, onViewCard, onEdit, onDelete }) {
  const { date, weekday, tags, organizedByAi, attachments } = record;
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  return (
    <li className="relative pb-5 pl-7">
      {!isLast && <span aria-hidden="true" className="absolute top-2 bottom-0 left-[7px] w-0.5 bg-line" />}
      <span
        aria-hidden="true"
        className="absolute top-1 left-0 size-4 rounded-full bg-shape-yellow shadow-[0_0_0_3px_var(--color-canvas)]"
      />
      <article className="flex flex-col gap-2.5 rounded-[18px] bg-white px-[18px] py-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1 text-label text-ink-muted">
            {date}({weekday})
            {organizedByAi && <Badge>AI와 정리</Badge>}
          </p>
          <div className="flex items-center gap-3">
            <TextLink size="sm" onClick={() => onViewCard(record.id)}>카드 보기</TextLink>
            <TextLink size="sm" onClick={() => onEdit(record.id)}>수정</TextLink>
            <TextLink variant="danger" size="sm" onClick={() => setIsConfirmingDelete(true)}>삭제</TextLink>
          </div>
        </div>
        <dl className="grid grid-cols-[62.8px_minmax(0,1fr)] gap-x-3 gap-y-1">
          {RECORD_FIELDS.filter(({ key }) => record[key]).map(({ key, label }) => (
            <div key={key} className="col-span-2 grid grid-cols-subgrid">
              <dt className="text-label leading-[20.15px] text-ink-subtle">{label}</dt>
              <dd className="text-body-sm leading-[21.7px] text-ink">{record[key]}</dd>
            </div>
          ))}
        </dl>
        {tags.length > 0 && <CompetencyTags tags={tags} />}
        {attachments.length > 0 && (
          <ul aria-label="첨부 자료" className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <AttachmentChip key={attachment.id} kind={attachment.kind} name={attachment.name} />
            ))}
          </ul>
        )}
        {isConfirmingDelete && (
          <DeleteConfirm
            title="이 기록을 지울까요?"
            message="나의 사자록의 카드도 함께 지워져요. 지운 기록은 되돌릴 수 없어요."
            onCancel={() => setIsConfirmingDelete(false)}
            onConfirm={() => onDelete(record.id)}
          />
        )}
      </article>
    </li>
  );
}

export default function ProjectRecords({
  project,
  records,
  initialIsAdding,
  onAddRecord,
  onSaveRecord,
  onDeleteRecord,
  onViewCard,
}) {
  const { status } = project;
  const [editingRecordId, setEditingRecordId] = useState();
  const [isAdding, setIsAdding] = useState(initialIsAdding);

  function closeAddForm() {
    setIsAdding(false);

    // 주소로 연 폼이 새로고침할 때 다시 열리지 않도록 record 값을 지운다.
    const url = new URL(window.location.href);
    if (url.searchParams.has("record")) {
      url.searchParams.delete("record");
      window.history.replaceState(null, "", url);
    }
  }

  function startEditing(recordId) {
    closeAddForm();
    setEditingRecordId(recordId);
  }
  const editingRecord = records.find((record) => record.id === editingRecordId);

  return (
    <section aria-label="기록" className="flex min-w-0 flex-col gap-4">
      {editingRecord ? (
        <ProjectRecordForm
          key={editingRecord.id}
          record={editingRecord}
          onCancel={() => setEditingRecordId(undefined)}
          onSave={(changes) => {
            onSaveRecord(editingRecord.id, changes);
            setEditingRecordId(undefined);
          }}
        />
      ) : isAdding ? (
        <ProjectRecordAddForm
          projectId={project.id}
          onCancel={closeAddForm}
          onSave={(record) => {
            onAddRecord(record);
            closeAddForm();
          }}
        />
      ) : (
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsAdding(true)}>+ 기록 추가</Button>
          {status === "active" && (
            <p className="text-label leading-[19.5px] text-ink-subtle">{ADD_RECORD_HINT}</p>
          )}
        </div>
      )}
      {records.length > 0 ? (
        <ol>
          {records.map((record, index) => (
            <RecordItem
              key={record.id}
              record={record}
              isLast={index === records.length - 1}
              onViewCard={onViewCard}
              onEdit={startEditing}
              onDelete={(recordId) => {
                onDeleteRecord(recordId);
                setEditingRecordId((current) => (current === recordId ? undefined : current));
              }}
            />
          ))}
        </ol>
      ) : (
        <EmptyState>첫 기록을 남겨 보세요. 한 줄이어도 괜찮아요.</EmptyState>
      )}
    </section>
  );
}
