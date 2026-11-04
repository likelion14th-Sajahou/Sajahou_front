import { SHAPES } from "./shapePaths";

const COLOR_CLASSES = {
  yellow: "text-shape-yellow",
  coral: "text-shape-coral",
  green: "text-shape-green",
  blue: "text-shape-blue",
  peach: "text-shape-peach",
  muted: "text-shape-muted",
};

const FACES = {
  smile: { eyeRadius: 3, eyeGap: 7, mouth: "M-6 7C-2 10.33 2 10.33 6 7", mouthWidth: 2.4 },
  stickerSmile: {
    eyeRadius: 3.33,
    eyeGap: 6.48,
    mouth: "M-5.56 7.41C-1.85 10.49 1.85 10.49 5.56 7.41",
    mouthWidth: 2.59,
  },
  eyes: { eyeRadius: 4.5, eyeGap: 8 },
};

const STICKER_STROKE_WIDTH = 6.48;
const PLAIN_PENTAGON_STROKE_WIDTH = 6;

function Face({ type, y }) {
  const { eyeRadius, eyeGap, mouth, mouthWidth } = FACES[type];

  return (
    <g transform={`translate(50 ${y})`} className="text-ink">
      <circle cx={-eyeGap} r={eyeRadius} fill="currentColor" />
      <circle cx={eyeGap} r={eyeRadius} fill="currentColor" />
      {mouth && (
        <path
          d={mouth}
          fill="none"
          stroke="currentColor"
          strokeWidth={mouthWidth}
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

export default function ShapeCharacter({
  shape = "circle",
  color = "yellow",
  size = 70,
  face = "smile",
  sticker = false,
  label,
  className = "",
}) {
  const { plain, sticker: stickerGeometry } = SHAPES[shape];
  const isSticker = sticker && Boolean(stickerGeometry);
  const { d, faceY } = isSticker ? stickerGeometry : plain;
  const hasPlainPentagonStroke = shape === "pentagon" && !isSticker;

  let strokeProps = {};
  if (isSticker) {
    strokeProps = {
      stroke: "white",
      strokeWidth: STICKER_STROKE_WIDTH,
      strokeLinejoin: "round",
    };
  } else if (hasPlainPentagonStroke) {
    strokeProps = {
      stroke: "currentColor",
      strokeWidth: PLAIN_PENTAGON_STROKE_WIDTH,
      strokeLinejoin: "round",
    };
  }

  const faceType = face === "smile" && isSticker ? "stickerSmile" : face;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`shrink-0 ${COLOR_CLASSES[color]} ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={d} fill="currentColor" {...strokeProps} />
      {face !== "none" && <Face type={faceType} y={faceY} />}
    </svg>
  );
}
