import DrawnFieldFrame from "./DrawnFieldFrame";

const SIZE_CLASSES = {
  md: "rounded-[14px] px-4 text-body",
  sm: "rounded-xl px-3 text-label",
};

// 회색 바탕, 높이 48, 오류면 빨간 테두리. 편집·placeholder는 Pretendard, 읽기 전용 값은 NPS, 라벨·안내는 삼립호빵체.
const INPUT_HEIGHT_CLASSES = {
  md: "h-12 py-3",
  sm: "h-[38px] py-[7px]",
};

const TEXTAREA_PADDING_CLASSES = {
  md: "py-3",
  sm: "py-[7px]",
};

// 여러 줄 칸(textarea)은 높이를 고정하지 않는다. 최소 높이만 두고, 글이 넘치면 칸 안에서 스크롤하지 않고 칸이 늘어난다(field-sizing: content).
// 최소 높이 100px은 이번 주 회고 자료 화면 '실습 내용' 칸의 높이다. 화면에서 h-[…]로 높이를 고정하지 않는다.
// singleLine: 한 줄 높이(48px)에서 시작해 길면 감싸며 늘어나는 칸(예: 스토리 카드 제목).
// TextField를 쓰지 않는 textarea도 같은 규칙을 쓰도록 class를 내보낸다.
export const TEXTAREA_GROW_CLASSES = "field-sizing-content min-h-[100px]";
const SINGLE_LINE_GROW_CLASSES = "field-sizing-content min-h-12";

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
  singleLine = false,
  size = "md",
  appearance = "filled",
  rows = 3,
  className = "",
  labelClassName = "text-label leading-5 text-ink",
  error,
  drawn = false,
  wrapperClassName = "",
  ...rest
}) {
  const errorId = error ? `${rest.id || rest.name}-error` : undefined;
  const look = appearanceClasses(appearance, size, error);
  // drawn: 손그림 테두리 틀(DrawnFieldFrame) 안에 들어가는 둥근 흰 칸. 기본(filled) 모양 위에 덮어쓴다.
  const drawnClasses = drawn ? "rounded-full! border-transparent! bg-white! px-3.5! text-body-sm! text-ink-strong" : "";
  const fontClassName = rest.readOnly ? "font-sans" : "font-input";
  const controlClasses = `w-full ${fontClassName} text-ink ${look.control} ${drawnClasses} ${className}`;
  const accessibilityProps = error ? {
    "aria-invalid": true,
    "aria-describedby": [rest["aria-describedby"], errorId].filter(Boolean).join(" "),
  } : {};

  const control = multiline ? (
    <textarea
      rows={rows}
      className={`resize-none ${singleLine ? SINGLE_LINE_GROW_CLASSES : TEXTAREA_GROW_CLASSES} ${look.textarea} ${controlClasses}`}
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

  const framedControl = drawn ? (
    <DrawnFieldFrame className={wrapperClassName} error={Boolean(error)}>
      {control}
    </DrawnFieldFrame>
  ) : control;

  if (!label) {
    return framedControl;
  }

  return (
    <label className="flex w-full flex-col gap-2 font-display">
      <span className={labelClassName}>{label}</span>
      {framedControl}
      {error && <span id={errorId} className="text-caption leading-5 text-error">{error}</span>}
    </label>
  );
}
