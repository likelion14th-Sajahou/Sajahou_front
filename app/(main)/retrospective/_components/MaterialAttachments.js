import AttachmentChip, { ChipStatus } from "@/components/ui/AttachmentChip";
import FileDropZone from "@/components/ui/FileDropZone";

// 읽기 상태(API 9) 중 사용자가 알아야 할 것만 칩에 붙인다. 읽음(DONE)·읽지 않음(SKIPPED, 피그마)은 표시하지 않는다.
function readStatus(extractStatus) {
  if (extractStatus === "PENDING") return <ChipStatus>읽는 중</ChipStatus>;
  if (extractStatus === "FAILED") return <ChipStatus tone="warning">읽지 못함</ChipStatus>;
  return null;
}

// 올린 파일 칩과 넓은 업로드 칸을 세션·실습·과제에서 함께 사용한다. disabled면 올리는 중이라 새로 올리거나 뺄 수 없다.
// children: 업로드 칸 아래에 붙는 것(과제의 링크 입력).
export default function MaterialAttachments({
  files,
  onRemove,
  onSelect,
  accept,
  uploadLabel,
  disabled = false,
  children,
}) {
  return (
    <fieldset disabled={disabled} aria-busy={disabled} className="flex min-w-0 flex-col gap-2">
      {files.length > 0 && (
        <ul aria-label="첨부 자료" className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
          {files.map(({ id, name, kind, extractStatus }) => (
            <AttachmentChip
              key={id}
              kind={kind}
              name={name}
              status={readStatus(extractStatus)}
              warning={extractStatus === "FAILED"}
              showKind={false}
              onRemove={() => onRemove(id)}
            />
          ))}
        </ul>
      )}
      <FileDropZone label={uploadLabel} accept={accept} onSelect={onSelect} disabled={disabled} />
      {children}
    </fieldset>
  );
}
