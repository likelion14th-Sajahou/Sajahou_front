import DrawnFieldFrame from "./DrawnFieldFrame";

const SIZE_CLASSES = {
  md: "rounded-[14px] px-4 text-body",
  sm: "rounded-xl px-3 text-label",
};

// 디자인 시스템(Figma 'Input'·'Form Field'): 회색 바탕, 높이 48, 오류면 빨간 테두리. 라벨은 삼립호빵체.
const INPUT_HEIGHT_CLASSES = {
  md: "h-12 py-3",
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
  drawn = false,
  wrapperClassName = "",
  ...rest
}) {
  const errorId = error ? `${rest.id || rest.name}-error` : undefined;
  const drawnClasses = drawn ? "rounded-full! border-transparent! bg-white! px-3.5! text-body-sm! text-[#1f2433] placeholder:text-[#8a8f9a]" : "";
  const controlClasses = `w-full border ${error ? "border-error-line" : "border-transparent"} bg-canvas text-ink placeholder:text-placeholder ${SIZE_CLASSES[size]} ${drawnClasses} ${className}`;
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

  const framedControl = drawn ? (
    <DrawnFieldFrame height={size === "sm" ? 38 : 48} className={wrapperClassName} error={Boolean(error)}>
      {control}
    </DrawnFieldFrame>
  ) : control;

  if (!label) {
    return framedControl;
  }

  return (
    <label className="flex w-full flex-col gap-2">
      <span className="font-display text-label leading-5 text-ink">{label}</span>
      {framedControl}
      {error && <span id={errorId} className="text-caption leading-5 text-error">{error}</span>}
    </label>
  );
}
