import AttachmentChip from "@/components/ui/AttachmentChip";
import { attachmentCategoryName } from "./recordFields";

// 기록과 함께 저장되는 자료(11/13 디자인): 자료 종류 + 이름 칩.
export default function SavedAttachments({ attachments }) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-label text-ink-subtle">함께 저장되는 자료</p>
      <ul className="flex flex-wrap gap-2">
        {attachments.map((attachment) => (
          <AttachmentChip key={attachment.id} kind={attachment.kind} name={attachment.name} showKind={!attachmentCategoryName(attachment.category)} prefix={attachmentCategoryName(attachment.category)} />
        ))}
      </ul>
    </div>
  );
}
