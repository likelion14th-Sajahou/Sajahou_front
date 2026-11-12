import CompetencyTagPicker from "@/components/my-record/CompetencyTagPicker";
import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";
import EmptyFieldsNotice from "./EmptyFieldsNotice";
import RecordFieldsGrid from "./RecordFieldsGrid";
import SavedAttachments from "./SavedAttachments";
import ActionFooter from "@/components/ui/ActionFooter";

// AI 정리 결과를 직접 보완하고 역량 태그를 선택해 저장한다.
export default function ProjectRecordReview({
  attachments,
  fields,
  isOrganizedByAi,
  competencies,
  tags,
  getFieldValueProps,
  onChangeTags,
  onTagLimit,
  onBack,
  onSave,
}) {
  return (
    <>
      {isOrganizedByAi && (
        <p className="text-label leading-[19.5px] text-ink-subtle">
          AI가 {attachments.length > 0 ? "첨부 자료와 답변" : "오늘 한 일과 답변"}을 바탕으로 정리했어요. 확인하고 고쳐서 저장하세요.
        </p>
      )}
      <EmptyFieldsNotice fields={fields} />
      <RecordFieldsGrid
        getFieldProps={({ key, formLabel }) => ({
          label: formLabel,
          // 정리된 글이 잘리지 않도록 내용 길이에 맞춰 칸이 늘어난다.
          className: "min-h-[76px] field-sizing-content",
          ...getFieldValueProps(key),
        })}
      />
      <p className="text-label leading-[19.5px] text-ink-subtle">
        저장하면 이 기록이 나의 사자록에 프로젝트 카드로 쌓여요.
      </p>
      <CompetencyTagPicker
        id="record-tags-label"
        competencies={competencies}
        selectedTags={tags}
        onChange={onChangeTags}
        onLimit={onTagLimit}
      />
      <SavedAttachments attachments={attachments} />
      <ActionFooter>
        <TextLink onClick={onBack}>{isOrganizedByAi ? "← 질문으로" : "← 자료로"}</TextLink>
        <Button className="ml-auto" onClick={onSave}>기록 저장</Button>
      </ActionFooter>
    </>
  );
}
