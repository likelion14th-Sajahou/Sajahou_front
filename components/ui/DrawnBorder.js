// Figma Dynamic stroke 원본을 사용한다. 9분할로 모서리와 선 두께를 유지한다.
// 이미지는 Figma에서 내보낸 선을 2배 PNG로 만든 것이라, 이미지 픽셀로 자르는 값(borderImageSlice)은 slice의 2배다.
// outset: 선이 요소 밖으로 나간 거리(이미지 가장자리와 요소 가장자리의 차이), slice: 모서리로 남길 길이(px).
const IMAGE_SCALE = 2;

const BORDERS = {
  // 홈
  "sticker-board": { folder: "home", outset: 3.14, slice: 32 },
  "matching-card": { folder: "home", outset: 3.04, slice: 32 },
  "projects-card": { folder: "home", outset: 3.1, slice: 32 },
  "recent-card": { folder: "home", outset: 3.08, slice: 24 },
  "project-row": { folder: "home", outset: 1.56, slice: 20 },
  "new-project-button": { folder: "home", outset: 0, slice: 20 },
  "new-project-dialog": { folder: "home", outset: 0, slice: 36 },
  // 이번 주 회고 시작 화면. 요소보다 사방 4px 크게 내보냈다.
  "start-card": { folder: "retrospective", outset: 4, slice: 32 },
  "deadline-card": { folder: "retrospective", outset: 4, slice: 32 },
  bubble: { folder: "retrospective", outset: 4, slice: 28 },
  "paused-card": { folder: "retrospective", outset: 4, slice: 40 },
  // 둥근 버튼(Button의 soft·inverse·ink·ink-outline)
  "pill-cream": { folder: "retrospective", outset: 4, slice: 26 },
  "pill-white": { folder: "retrospective", outset: 4, slice: 26 },
  "pill-ink": { folder: "retrospective", outset: 4, slice: 26 },
};

// 부모 요소에 relative가 있어야 한다. 부모에는 border를 주지 않는다(선이 이 이미지로 대신 그려진다).
export default function DrawnBorder({ variant }) {
  const { folder, outset, slice } = BORDERS[variant];

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute z-10"
      style={{
        inset: -outset,
        borderStyle: "solid",
        borderColor: "transparent",
        borderWidth: slice,
        borderImageSource: `url(/images/${folder}/border-${variant}.png)`,
        borderImageSlice: slice * IMAGE_SCALE,
        borderImageWidth: `${slice}px`,
        borderImageRepeat: "stretch",
      }}
    />
  );
}
