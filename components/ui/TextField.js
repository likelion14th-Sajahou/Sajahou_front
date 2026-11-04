const SIZE_CLASSES = {
  md: "rounded-[14px] px-4 text-body",
  sm: "rounded-xl px-3 text-label",
};

const INPUT_HEIGHT_CLASSES = {
  md: "h-[50px] py-3",
  sm: "h-[38px] py-[7px]",
};

const TEXTAREA_PADDING_CLASSES = {
  md: "py-3",
  sm: "py-[7px]",
};

export default function TextField({
  label,
  multiline = false,
  size = "md",
  rows = 3,
  className = "",
  ...rest
}) {
  const controlClasses = `w-full border border-transparent bg-canvas text-ink placeholder:text-placeholder ${SIZE_CLASSES[size]} ${className}`;

  const control = multiline ? (
    <textarea
      rows={rows}
      className={`resize-none ${TEXTAREA_PADDING_CLASSES[size]} ${controlClasses}`}
      {...rest}
    />
  ) : (
    <input
      className={`${INPUT_HEIGHT_CLASSES[size]} ${controlClasses}`}
      {...rest}
    />
  );

  if (!label) {
    return control;
  }

  return (
    <label className="flex w-full flex-col gap-1.5">
      <span className="text-label text-ink-muted">{label}</span>
      {control}
    </label>
  );
}
