import AttachmentChip from "./AttachmentChip";

export default function SavedAttachments({ attachments }) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-label text-ink-muted">함께 저장되는 자료</p>
      <ul className="flex flex-wrap gap-2">
        {attachments.map((attachment) => (
          <AttachmentChip key={attachment.id} attachment={attachment} />
        ))}
      </ul>
    </div>
  );
}
