"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";

// 손그림 테두리(이슈 #65). Figma '테두리 샘플'(11/16)의 Dynamic 선을 코드로 그린다.
// Figma 설정: Frequency 400% · Wiggle 20% · Smoothen 100%. 내보낸 선을 재 보면
// 두께의 4배 간격마다 선이 두께의 0.2배만큼 안팎으로 흔들리고, 그 사이를 부드러운 곡선으로 잇는다.
// 박스 크기와 모서리 곡률(부모의 border-radius)을 재서 그때그때 그리므로, 길이가 달라도 물결 간격과 두께가 같다.
const WAVE_SPACING = 4;
const WAVE_HEIGHT = 0.2;
// 선을 몇 px 간격의 점으로 이을지. 작을수록 곡선이 매끈하다.
const SAMPLE_STEP = 2;

// 같은 크기면 같은 물결이 나오도록 크기로 정한 씨앗을 쓰는 의사 난수(mulberry32)다.
function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 닫힌 고리 위의 흔들림 값을 Catmull-Rom 곡선으로 부드럽게 잇는다.
function smoothOffset(knots, position) {
  const count = knots.length;
  const index = Math.floor(position);
  const t = position - index;
  const at = (i) => knots[((i % count) + count) % count];
  const [p0, p1, p2, p3] = [at(index - 1), at(index), at(index + 1), at(index + 2)];
  return 0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (3 * p1 - p0 - 3 * p2 + p3) * t * t * t);
}

// 너비 w·높이 h·모서리 r인 둥근 사각형의 가장자리를 따라 흔들리는 선(SVG path)을 만든다.
export function drawnBorderPath(w, h, r, strokeWidth) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  const straightW = w - 2 * radius;
  const straightH = h - 2 * radius;
  const arc = (Math.PI / 2) * radius;
  const perimeter = 2 * (straightW + straightH) + 4 * arc;
  // 가장자리 위의 거리 s에서의 점과 바깥쪽 방향(법선)이다. 위쪽 직선부터 시계 방향으로 돈다.
  const segments = [
    [straightW, (s) => [radius + s, 0, 0, -1]],
    [arc, (s) => corner(w - radius, radius, -Math.PI / 2 + s / Math.max(radius, 1e-6))],
    [straightH, (s) => [w, radius + s, 1, 0]],
    [arc, (s) => corner(w - radius, h - radius, s / Math.max(radius, 1e-6))],
    [straightW, (s) => [w - radius - s, h, 0, 1]],
    [arc, (s) => corner(radius, h - radius, Math.PI / 2 + s / Math.max(radius, 1e-6))],
    [straightH, (s) => [0, h - radius - s, -1, 0]],
    [arc, (s) => corner(radius, radius, Math.PI + s / Math.max(radius, 1e-6))],
  ];
  function corner(cx, cy, angle) {
    const nx = Math.cos(angle);
    const ny = Math.sin(angle);
    return [cx + nx * radius, cy + ny * radius, nx, ny];
  }
  function pointAt(distance) {
    let rest = distance;
    for (const [length, at] of segments) {
      if (rest <= length) return at(rest);
      rest -= length;
    }
    const [length, at] = segments.at(-1);
    return at(length);
  }

  const knotCount = Math.max(4, Math.round(perimeter / (WAVE_SPACING * strokeWidth)));
  const random = seededRandom(Math.round(w) * 73856093 ^ Math.round(h) * 19349663);
  const knots = Array.from({ length: knotCount }, () => (random() * 2 - 1) * WAVE_HEIGHT * strokeWidth);
  const sampleCount = Math.max(knotCount, Math.ceil(perimeter / SAMPLE_STEP));
  const points = [];
  for (let i = 0; i < sampleCount; i += 1) {
    const distance = (perimeter * i) / sampleCount;
    const [x, y, nx, ny] = pointAt(distance);
    const offset = smoothOffset(knots, (distance / perimeter) * knotCount);
    points.push(`${(x + nx * offset).toFixed(2)} ${(y + ny * offset).toFixed(2)}`);
  }
  return `M${points.join("L")}Z`;
}

// 예전 PNG 테두리(버튼·칩용). 버튼·칩·입력칸 틀을 바꾸는 다음 커밋에서 지운다.
const IMAGE_SCALE = 2;
const LEGACY_BORDERS = {
  "pill-cream": { folder: "retrospective", outset: 4, slice: 26, pill: true },
  "pill-white": { folder: "retrospective", outset: 4, slice: 26 },
  "pill-ink": { folder: "retrospective", outset: 4, slice: 26 },
  "pill-ink-sm": { folder: "retrospective", outset: 4, slice: 23 },
  "pill-muted": { folder: "retrospective", outset: 4, slice: 26 },
  "pill-yellow": { folder: "retrospective", outset: 4, slice: 26 },
  "chip-ink": { folder: "retrospective", outset: 4, slice: 19, pill: true },
  "chip-line": { folder: "retrospective", outset: 4, slice: 19, pill: true },
  "new-project-button": { folder: "home", outset: 0, slice: 20 },
};

function LegacyDrawnBorder({ variant, repeat = "stretch", color }) {
  const colorFilterId = useId();
  const { folder, outset, slice, pill } = LEGACY_BORDERS[variant];
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
          borderImageSource: `url(/images/${folder}/border-${variant}.png)`,
          borderImageSlice: slice * IMAGE_SCALE,
          borderImageWidth: pill ? borderWidth : `${slice}px`,
          borderImageRepeat: repeat,
          filter: color ? `url(#${colorFilterId})` : undefined,
        }}
      />
    </>
  );
}

// 부모 요소에 relative와 둥근 모서리(rounded-*)가 있어야 한다. 부모에는 border를 주지 않는다.
// color: 선 색(CSS 색이나 var(--color-…)), width: 선 두께(기본 4px. 나의 사자록의 카드만 2px).
// 선의 가운데가 박스 가장자리를 따라가서, 두께의 절반은 박스 밖으로 나간다(Figma 'Center' 선).
// 그리기 전(서버 렌더링·첫 화면)에는 같은 색·두께의 곧은 선을 보여 준다.
export default function DrawnBorder({ variant, repeat, color, width = 4 }) {
  // 예전 PNG는 color가 없으면 원본 색을 쓴다.
  if (variant && LEGACY_BORDERS[variant]) return <LegacyDrawnBorder variant={variant} repeat={repeat} color={color} />;
  return <BoxBorder color={color ?? "var(--color-ink)"} width={width} />;
}

function BoxBorder({ color, width }) {
  const ref = useRef(null);
  const [box, setBox] = useState(null);

  useLayoutEffect(() => {
    const element = ref.current;
    function measure() {
      const w = element.offsetWidth;
      const h = element.offsetHeight;
      const r = parseFloat(getComputedStyle(element.parentElement).borderTopLeftRadius) || 0;
      setBox((previous) => (previous && previous.w === w && previous.h === h && previous.r === r ? previous : { w, h, r }));
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
      style={box?.w ? undefined : { boxShadow: `0 0 0 ${width / 2}px ${color}, inset 0 0 0 ${width / 2}px ${color}` }}
    >
      {box?.w > 0 && (
        <svg width={box.w} height={box.h} className="absolute top-0 left-0 overflow-visible">
          <path d={drawnBorderPath(box.w, box.h, box.r, width)} fill="none" strokeWidth={width} strokeLinejoin="round" style={{ stroke: color }} />
        </svg>
      )}
    </span>
  );
}
