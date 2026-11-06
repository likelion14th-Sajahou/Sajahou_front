export default function RecordFormFooter({ gapClassName = "gap-3.5", children }) {
  return (
    <div className="w-full pt-1">
      <div className={`flex items-center border-t border-line pt-4 ${gapClassName}`}>{children}</div>
    </div>
  );
}
