import AttachmentChip from "@/components/ui/AttachmentChip";
import FileUploadButton from "@/components/ui/FileUploadButton";

// 파일 목록과 업로드 컨트롤을 세션·실습·과제에서 함께 사용한다.
export default function MaterialAttachments({
  files,
  onRemove,
  onSelect,
  accept,
  uploadLabel,
  uploadOnNewLine = false,
  children,
}) {
  const fileItems = files.map(({ id, name, kind }) => (
    <AttachmentChip key={id} kind={kind} name={name} onRemove={() => onRemove(id)} />
  ));

  const upload = <FileUploadButton label={uploadLabel} accept={accept} onSelect={onSelect} />;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
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
    </div>
  );
}
