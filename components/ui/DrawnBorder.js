// Figma Dynamic stroke 원본을 사용한다. 9분할로 모서리와 선 두께를 유지한다.
const BORDERS = {
  "sticker-board": { outset: 3.14, slice: 32 },
  "matching-card": { outset: 3.04, slice: 32 },
  "projects-card": { outset: 3.1, slice: 32 },
  "recent-card": { outset: 3.08, slice: 24 },
  "project-row": { outset: 1.56, slice: 20 },
  "new-project-button": { outset: 0, slice: 20 },
  "new-project-dialog": { outset: 0, slice: 36 },
};

export default function DrawnBorder({ variant }) {
  const { outset, slice } = BORDERS[variant];

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute z-10"
      style={{
        inset: -outset,
        borderStyle: "solid",
        borderColor: "transparent",
        borderWidth: slice,
        borderImageSource: `url(/images/home/border-${variant}.svg)`,
        borderImageSlice: slice,
        borderImageWidth: `${slice}px`,
        borderImageRepeat: "stretch",
      }}
    />
  );
}
