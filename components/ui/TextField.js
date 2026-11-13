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

// appearance: 칸의 바탕과 테두리.
// - filled: 디자인 시스템 기본(회색 바탕, 테두리 없음).
// - outlined: 흰 바탕 + 2px 회색 테두리, 누르면 진하게(회고 검토의 스토리 카드 초안, 11/13 디자인). md 크기만 쓴다.
// - plain: 흰 바탕, 테두리 없음(회고 검토의 회고록처럼 손그림 테두리 상자 안에 들어가는 칸).
function appearanceClasses(appearance, size, error) {
  if (appearance === "outlined") {
    return {
      control: `rounded-2xl border-2 bg-white px-3.5 text-body ${error ? "border-error-line" : "border-ink-300 focus:border-ink"}`,
      input: "h-12 py-2.5",
      textarea: "py-2.5",
    };
  }
  if (appearance === "plain") {
    return { control: "rounded-[14px] bg-white px-[18px] text-body", input: "h-12 py-3", textarea: "py-4" };
  }
  return {
    control: `border ${error ? "border-error-line" : "border-transparent"} bg-canvas ${SIZE_CLASSES[size]}`,
    input: INPUT_HEIGHT_CLASSES[size],
    textarea: TEXTAREA_PADDING_CLASSES[size],
  };
}

export default function TextField({
  label,
  multiline = false,
  size = "md",
  appearance = "filled",
  rows = 3,
  className = "",
  labelClassName = "font-display text-label leading-5 text-ink",
  error,
  ...rest
}) {
  const errorId = error ? `${rest.id || rest.name}-error` : undefined;
  const look = appearanceClasses(appearance, size, error);
  const controlClasses = `w-full text-ink placeholder:text-placeholder ${look.control} ${className}`;
  const accessibilityProps = error ? {
    "aria-invalid": true,
    "aria-describedby": [rest["aria-describedby"], errorId].filter(Boolean).join(" "),
  } : {};

  const control = multiline ? (
    <textarea
      rows={rows}
      className={`resize-none ${look.textarea} ${controlClasses}`}
      {...rest}
      {...accessibilityProps}
    />
  ) : (
    <input
      className={`${look.input} ${controlClasses}`}
      {...rest}
      {...accessibilityProps}
    />
  );

  if (!label) {
    return control;
  }

  return (
    <label className="flex w-full flex-col gap-2">
      <span className={labelClassName}>{label}</span>
      {control}
      {error && <span id={errorId} className="text-caption leading-5 text-error">{error}</span>}
    </label>
  );
}
