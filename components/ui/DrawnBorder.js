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
  // 이번 주 회고. 요소보다 사방 4px 크게 내보냈다. 자료 화면의 오른쪽 안내 카드도 deadline-card를 쓴다(같은 모양).
  "start-card": { folder: "retrospective", outset: 4, slice: 32 },
  "deadline-card": { folder: "retrospective", outset: 4, slice: 32 },
  bubble: { folder: "retrospective", outset: 4, slice: 28 },
  "paused-card": { folder: "retrospective", outset: 4, slice: 40 },
  // 둥근 버튼(Button의 soft·inverse·ink·ink-outline·inverse-muted·cta). -sm은 높이 38px(size="sm")용이다.
  "pill-cream": { folder: "retrospective", outset: 4, slice: 26 },
  "pill-white": { folder: "retrospective", outset: 4, slice: 26 },
  "pill-ink": { folder: "retrospective", outset: 4, slice: 26 },
  "pill-ink-sm": { folder: "retrospective", outset: 4, slice: 23 },
  "pill-muted": { folder: "retrospective", outset: 4, slice: 26 },
  "pill-yellow": { folder: "retrospective", outset: 4, slice: 26 },
  // 이번 주 회고 자료 화면
  "materials-card": { folder: "retrospective", outset: 4, slice: 32 },
  // 흰 섹션 카드. 접혀서 짧을 때(실습 없음·과제 나중에 등)는 짧은 원본을 써야 물결 간격이 맞는다.
  "section-card": { folder: "retrospective", outset: 4, slice: 28 },
  "section-card-short": { folder: "retrospective", outset: 4, slice: 28 },
  "memo-field": { folder: "retrospective", outset: 4, slice: 22 },
  // 이번 주 회고 검토 화면: 회고록 흰 상자, 스토리 카드 초안 카드(진한 선).
  // 11/13 Figma의 물결 모양을 그대로 쓰되, 얇아진 선을 예전 두께(약 4px)로 넓혀 만들었다.
  "notion-box": { folder: "retrospective", outset: 4, slice: 32 },
  "story-card": { folder: "retrospective", outset: 4, slice: 32 },
  // 자료가 바뀌었어요 안내(11/13 디자인): 예전 분홍 안내와 같은 손그림 선을 주황(#ffb37a)으로 칠했다.
  "alert-orange": { folder: "retrospective", outset: 4, slice: 24 },
  // 선택 칩(Chip drawn): 선택됨·기본
  "chip-ink": { folder: "retrospective", outset: 4, slice: 20 },
  "chip-line": { folder: "retrospective", outset: 4, slice: 20 },
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
