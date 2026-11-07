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
  error,
  ...rest
}) {
  const errorId = error ? `${rest.id || rest.name}-error` : undefined;
  const controlClasses = `w-full border ${error ? "border-error-line" : "border-transparent"} bg-canvas text-ink placeholder:text-placeholder ${SIZE_CLASSES[size]} ${className}`;
  const accessibilityProps = error ? {
    "aria-invalid": true,
    "aria-describedby": [rest["aria-describedby"], errorId].filter(Boolean).join(" "),
  } : {};

  const control = multiline ? (
    <textarea
      rows={rows}
      className={`resize-none ${TEXTAREA_PADDING_CLASSES[size]} ${controlClasses}`}
      {...rest}
      {...accessibilityProps}
    />
  ) : (
    <input
      className={`${INPUT_HEIGHT_CLASSES[size]} ${controlClasses}`}
      {...rest}
      {...accessibilityProps}
    />
  );

  if (!label) {
    return control;
  }

  return (
    <label className="flex w-full flex-col gap-1.5">
      <span className="text-label text-ink-muted">{label}</span>
      {control}
      {error && <span id={errorId} className="pt-0.5 text-label leading-[20.8px] text-error">{error}</span>}
    </label>
  );
}
