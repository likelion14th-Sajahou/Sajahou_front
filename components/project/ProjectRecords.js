"use client";

import { useState } from "react";
import Image from "next/image";
import CompetencyTags from "@/components/my-record/CompetencyTags";
import AttachmentChip from "@/components/ui/AttachmentChip";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import DrawnBorder from "@/components/ui/DrawnBorder";
import EmptyState from "@/components/ui/EmptyState";
import TextLink from "@/components/ui/TextLink";
import DeleteConfirm from "./DeleteConfirm";
import ProjectRecordAddForm from "./ProjectRecordAddForm";
import ProjectRecordForm from "./ProjectRecordForm";
import { RECORD_FIELDS, attachmentCategoryName } from "./recordFields";
import useProjectAction from "./useProjectAction";
import TextField from "@/components/ui/TextField";
import { formatMonthDay } from "@/lib/formatDate";
import { recordBadgeImage } from "@/lib/stickerBadges";

// 기록 추가 입구(11/13 디자인): 진한 카드에 구름 캐릭터와 안내, 연노랑 '기록 추가' 버튼.
// 완료한 프로젝트는 끝난 뒤의 결과를 남기도록 안내 문구가 다르다(H-21, 12-a).
function AddRecordPrompt({ status, onAdd }) {
  return (
    <div className="relative flex flex-wrap items-center gap-3.5 rounded-[24px] bg-ink-900 px-5 py-4 text-white">
      <DrawnBorder variant="start-card" />
      <Image src="/images/characters/cloud-small.png" alt="" width={56} height={47} className="shrink-0" />
      <p className="min-w-0 flex-1 font-display text-[16px] leading-6">
        {status === "active" ? (
          <>
            오늘 한 일을 남겨 볼까요?
            <br />
            <span className="font-sans text-label leading-5 text-locked">회의록·시안·링크를 올리면 AI가 정리를 도와요</span>
          </>
        ) : "끝난 뒤에 생긴 결과도 남겨 보세요"}
      </p>
      <Button variant="soft" onClick={onAdd}>
        <span className="inline-flex items-center gap-1.5">
          <Image src="/images/common/plus.svg" alt="" width={16} height={16} />
          기록 추가
        </span>
      </Button>
    </div>
  );
}

// 기록 하나(11/13 디자인): 왼쪽 상장 스티커와 점선, 흰 카드에 회색 손그림 테두리.
// 기록 내용은 사용자가 남긴 글이라 Pretendard(font-input)다.
function RecordItem({ record, order, isLast, onViewCard, onEdit, onDelete, onResult }) {
  const { date, weekday, tags, organizedByAi, attachments } = record;
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { run, busy, error } = useProjectAction();
  const [result, setResult] = useState("");

  return (
    <li className="relative pb-5 pl-[46px]">
      {!isLast && <span aria-hidden="true" className="absolute top-[38px] bottom-1 left-[15px] border-l-2 border-dashed border-[#cfcdc6]" />}
      <Image src={recordBadgeImage(order)} alt="" width={30} height={30} className="absolute top-2 left-px size-[30px] object-contain" />
      <fieldset disabled={busy} className="relative flex min-w-0 flex-col gap-3 rounded-[22px] bg-white px-[22px] py-[18px]">
        <DrawnBorder variant="start-card" color="var(--color-ink-300)" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-[3px] text-label font-bold text-yellow-700">
            {formatMonthDay(date)}({weekday})
            {organizedByAi && <Badge tone="plain" size="xs" className="bg-white! text-ink-subtle!">AI와 정리</Badge>}
          </p>
          <div className="flex items-center gap-3">
            <TextLink size="sm" onClick={() => onViewCard(record.id)}>카드 보기</TextLink>
            <TextLink size="sm" onClick={() => onEdit(record.id)}>수정</TextLink>
            <TextLink variant="danger" size="sm" className="text-error!" onClick={() => setIsConfirmingDelete(true)}>삭제</TextLink>
          </div>
        </div>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1">
          {RECORD_FIELDS.filter(({ key }) => record[key]).map(({ key, label }) => (
            <div key={key} className="col-span-2 grid grid-cols-subgrid">
              <dt className="text-label leading-[21.7px] font-bold whitespace-nowrap text-ink-500">{label}</dt>
              <dd className="font-input whitespace-pre-wrap break-words text-body-sm leading-[21.7px] text-ink-strong">{record[key]}</dd>
            </div>
          ))}
        </dl>
        {tags.length > 0 && <CompetencyTags tags={tags} />}
        {/* 결과가 빈 기록에만 여는 AI 제안(프로토타입의 'AI 제안 · 선택' 상자 모양). */}
        {!record.result && <details className="rounded-2xl bg-tint-orange px-4 py-3.5">
          <summary className="cursor-pointer text-label font-bold text-accent-strong">AI 제안 · 결과를 더 남겨 볼까요?</summary>
          <div className="flex flex-col items-start gap-2.5 pt-2.5">
            <p className="text-body-sm text-ink">직접 확인한 결과나 받은 반응이 있나요? 모르면 비워 두어도 괜찮아요.</p>
            <TextField multiline aria-label="추가할 결과" placeholder="한 줄이면 충분해요" value={result} onChange={(e) => setResult(e.target.value)} className="h-[74px] bg-white! font-input leading-6" />
            <Button variant="ink" size="sm" disabled={!result.trim()} onClick={() => run(() => onResult(record.id, result.trim()))}>결과 추가</Button>
          </div>
        </details>}
        {attachments.length > 0 && (
          <ul aria-label="첨부 자료" className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <AttachmentChip key={attachment.id} kind={attachment.kind} name={attachment.name} showKind={!attachmentCategoryName(attachment.category)} prefix={attachmentCategoryName(attachment.category)} />
            ))}
          </ul>
        )}
        {isConfirmingDelete && (
          <DeleteConfirm
            title="이 기록을 지울까요?"
            message="나의 사자록의 카드도 함께 지워져요. 지운 기록은 되돌릴 수 없어요."
            onCancel={() => setIsConfirmingDelete(false)}
            onConfirm={() => run(() => onDelete(record.id))}
          />
        )}
        {error && <p role="alert">{error}</p>}
      </fieldset>
    </li>
  );
}

export default function ProjectRecords({
  project,
  records,
  isAdding,
  onChangeAdding,
  onAddRecord,
  onSaveRecord,
  onDeleteRecord,
  onViewCard,
}) {
  const { status } = project;
  const [editingRecordId, setEditingRecordId] = useState();

  function closeAddForm() {
    onChangeAdding(false);
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
          onSave={async (changes, signal) => {
            await onSaveRecord(editingRecord.id, changes, signal);
            setEditingRecordId(undefined);
          }}
        />
      ) : isAdding ? (
        <ProjectRecordAddForm
          projectId={project.id}
          onCancel={closeAddForm}
          onSave={async (record) => {
            await onAddRecord(record);
            closeAddForm();
          }}
        />
      ) : (
        <AddRecordPrompt status={status} onAdd={() => onChangeAdding(true)} />
      )}
      {records.length > 0 ? (
        <ol className="mt-1">
          {records.map((record, index) => (
            <RecordItem
              key={record.id}
              record={record}
              // 스티커는 오래된 기록부터 차례로 붙는다(최신 기록이 위에 있다).
              order={records.length - 1 - index}
              isLast={index === records.length - 1}
              onViewCard={onViewCard}
              onEdit={startEditing}
              onResult={(recordId, result) => onSaveRecord(recordId, { result })}
              onDelete={async (recordId) => {
                await onDeleteRecord(recordId);
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
