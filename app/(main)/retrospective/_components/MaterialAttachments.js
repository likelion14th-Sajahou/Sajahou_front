import AttachmentChip, { ChipStatus } from "@/components/ui/AttachmentChip";
import FileUploadButton from "@/components/ui/FileUploadButton";

// 읽기 상태(API 9) 중 사용자가 알아야 할 것만 칩에 붙인다. 읽음(DONE)·읽지 않음(SKIPPED, 피그마)은 표시하지 않는다.
function readStatus(extractStatus) {
  if (extractStatus === "PENDING") return <ChipStatus>읽는 중</ChipStatus>;
  if (extractStatus === "FAILED") return <ChipStatus tone="warning">읽지 못함</ChipStatus>;
  return null;
}

// 파일 목록과 업로드 컨트롤을 세션·실습·과제에서 함께 사용한다. disabled면 올리는 중이라 새로 올리거나 뺄 수 없다.
export default function MaterialAttachments({
  files,
  onRemove,
  onSelect,
  accept,
  uploadLabel,
  uploadOnNewLine = false,
  disabled = false,
  children,
}) {
  const fileItems = files.map(({ id, name, kind, extractStatus }) => (
    <AttachmentChip
      key={id}
      kind={kind}
      name={name}
      status={readStatus(extractStatus)}
      warning={extractStatus === "FAILED"}
      badgeTone="plain"
      onRemove={() => onRemove(id)}
    />
  ));

  const upload = <FileUploadButton label={uploadLabel} accept={accept} onSelect={onSelect} />;

  return (
    <fieldset disabled={disabled} aria-busy={disabled} className="flex min-w-0 flex-col gap-1.5">
      {uploadOnNewLine ? (
        <>
          {files.length > 0 && <ul aria-label="첨부 자료" className="flex min-w-0 max-w-full flex-wrap items-center gap-2">{fileItems}</ul>}
          <div className="flex flex-wrap items-center gap-2">{upload}{children}</div>
        </>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {files.length > 0 && <ul aria-label="첨부 자료" className="flex min-w-0 max-w-full flex-wrap items-center gap-2">{fileItems}</ul>}
          {upload}
        </div>
      )}
    </fieldset>
  );
}
