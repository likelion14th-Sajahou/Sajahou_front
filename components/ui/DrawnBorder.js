import { useId } from "react";

// Figma Dynamic stroke 원본을 사용한다. 9분할로 모서리와 선 두께를 유지한다.
// 이미지는 Figma에서 내보낸 선을 2배 PNG로 만든 것이라, 이미지 픽셀로 자르는 값(borderImageSlice)은 slice의 2배다.
// outset: 선이 요소 밖으로 나간 거리(이미지 가장자리와 요소 가장자리의 차이), slice: 모서리로 남길 길이(px).
const IMAGE_SCALE = 2;

const BORDERS = {
  // 홈
  "sticker-board": { folder: "home", outset: 3.14, slice: 32 },
  "matching-card": { folder: "home", outset: 3.04, slice: 32 },
  "projects-card": { folder: "home", outset: 3.1, slice: 32 },
  // 여러 화면에서 재사용하는 테두리는 시각적 특성으로 구분한다. asset은 기존 원본 파일명이다.
  "thick-outline": { folder: "home", asset: "recent-card", outset: 3.08, slice: 24 },
  "thin-outline": { folder: "home", asset: "project-row", outset: 1.56, slice: 20 },
  "new-project-button": { folder: "home", outset: 0, slice: 20 },
  // 이번 주 회고. 요소보다 사방 4px 크게 내보냈다. 자료 화면의 오른쪽 안내 카드도 deadline-card를 쓴다(같은 모양).
  "start-card": { folder: "retrospective", outset: 4, slice: 32 },
  "deadline-card": { folder: "retrospective", outset: 4, slice: 32 },
  bubble: { folder: "retrospective", outset: 4, slice: 28 },
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
  // 자료가 바뀌었어요 안내(11/13 디자인): 예전 분홍 안내와 같은 손그림 선을 주황(#ffb37a)으로 칠했다.
  "alert-orange": { folder: "retrospective", outset: 4, slice: 24 },
  // 선택 칩(Chip drawn): 선택됨·기본
  // 원본 높이 40px에서 위아래 19px씩 보존해 세로 변으로 반복할 2px을 남긴다.
  "chip-ink": { folder: "retrospective", outset: 4, slice: 19, pill: true },
  "chip-line": { folder: "retrospective", outset: 4, slice: 19, pill: true },
};

// 부모 요소에 relative가 있어야 한다. 부모에는 border를 주지 않는다(선이 이 이미지로 대신 그려진다).
// repeat="round": 원본보다 긴 박스는 선을 반복하고, 반복 개수에 맞춰 조금씩 조정한다.
// 기본 stretch는 기존 화면의 모양을 유지한다.
// color는 원본의 투명도를 그대로 사용해 색만 바꾼다. 선의 두께·굴곡은 변경하지 않는다.
export default function DrawnBorder({ variant, repeat = "stretch", color }) {
  const colorFilterId = useId();
  const { folder, outset, slice, pill, asset = variant } = BORDERS[variant];
  // 칩의 모서리는 실제 높이와 함께 커져야 배경의 rounded-full과 곡률이 맞는다.
  const borderWidth = pill ? `calc((var(--drawn-border-height, 32px) + ${outset * 2}px) / 2 - 1px)` : slice;

  return (
    <>
      {color && (
        <svg aria-hidden="true" width="0" height="0" className="pointer-events-none absolute">
          <defs>
            <filter id={colorFilterId} colorInterpolationFilters="sRGB">
              <feFlood floodColor={color} result="color" />
              <feComposite in="color" in2="SourceAlpha" operator="in" />
            </filter>
          </defs>
        </svg>
      )}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute z-10"
        style={{
          inset: -outset,
          borderStyle: "solid",
          borderColor: "transparent",
          borderWidth,
          borderImageSource: `url(/images/${folder}/border-${asset}.png)`,
          borderImageSlice: slice * IMAGE_SCALE,
          borderImageWidth: pill ? borderWidth : `${slice}px`,
          borderImageRepeat: repeat,
          filter: color ? `url(#${colorFilterId})` : undefined,
        }}
      />
    </>
  );
}
