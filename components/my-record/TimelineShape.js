import { TIMELINE_SHAPES } from "./timelineShapes";

const COLOR_CLASSES = {
  yellow: "text-shape-yellow",
  coral: "text-shape-coral",
  green: "text-shape-green",
  blue: "text-shape-blue",
  accent: "text-accent",
};

const EYE_POSITIONS = [14.28, 19.72];
const STROKE_WIDTH = 1.36;

// 받은 스티커(흰 테두리)와 비율이 달라 ShapeCharacter 대신 시안의 경로를 그대로 쓴다.
export function TimelineSticker({ shape, color, outlined = true }) {
  const { offset, eyeY, d } = TIMELINE_SHAPES[shape];

  return (
    <svg width={34} height={34} viewBox="0 0 34 34" aria-hidden="true" className={`shrink-0 ${COLOR_CLASSES[color]}`}>
      <path
        d={d}
        transform={`translate(${offset[0]} ${offset[1]})`}
        fill="currentColor"
        stroke={outlined ? "white" : undefined}
        strokeWidth={outlined ? STROKE_WIDTH : undefined}
        strokeLinejoin="round"
      />
      {EYE_POSITIONS.map((cx) => (
        <circle key={cx} cx={cx} cy={eyeY} r={1.53} className="fill-ink" />
      ))}
    </svg>
  );
}

export function TimelinePlaceholder({ shape }) {
  const { offset, d } = TIMELINE_SHAPES[shape];

  return (
    <svg width={34} height={34} viewBox="0 0 34 34" aria-hidden="true" className="shrink-0 text-[#8c8273]">
      <path
        d={d}
        transform={`translate(${offset[0]} ${offset[1]})`}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE_WIDTH}
        strokeLinejoin="round"
      />
    </svg>
  );
}
