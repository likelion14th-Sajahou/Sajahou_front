import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";
import EmptyFieldsNotice from "./EmptyFieldsNotice";
import RecordFieldsGrid from "./RecordFieldsGrid";
import RecordFormFooter from "./RecordFormFooter";
import SavedAttachments from "./SavedAttachments";

export default function ProjectRecordReview({
  attachments,
  fields,
  getFieldValueProps,
  notice,
  onBack,
  onSave,
}) {
  return (
    <>
      <p className="text-label leading-[19.5px] text-ink-subtle">
        AI가 {attachments.length > 0 ? "첨부 자료" : "메모"}와 답변으로 정리했어요. 확인하고 고쳐서 저장하세요.
      </p>
      <EmptyFieldsNotice fields={fields} />
      <RecordFieldsGrid
        getFieldProps={({ key, formLabel }) => ({
          label: formLabel,
          // 정리된 글이 잘리지 않도록 내용 길이에 맞춰 칸이 늘어난다.
          className: "min-h-[76px] field-sizing-content",
          ...getFieldValueProps(key),
        })}
      />
      <SavedAttachments attachments={attachments} />
      {notice && <p role="alert" className="text-label text-tint-red-ink">{notice}</p>}
      <RecordFormFooter>
        <TextLink onClick={onBack}>← 자료로</TextLink>
        <Button className="ml-auto" onClick={onSave}>기록 저장</Button>
      </RecordFormFooter>
    </>
  );
}
