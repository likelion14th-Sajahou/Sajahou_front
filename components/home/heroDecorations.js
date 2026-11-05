// frame은 히어로 영역 기준 위치·크기, image는 frame 안에서 SVG가 놓이는 위치다(시안 좌표).
// 회전은 시안과 같이 frame 중심을 기준으로 한다.
const DESKTOP_DECORATIONS = [
  { kind: "ticket", left: "-2%", top: "23.2%", frame: [96, 57.594], image: [3.84, 5.76, 88.32, 46.075], rotate: -24, blur: true },
  { kind: "dome", left: "21%", top: "8.9%", frame: [156, 156], image: [6.24, 15.6, 143.52, 71.76], rotate: -32 },
  { kind: "burst", left: "45%", top: "6.4%", frame: [54, 54], image: [1.08, 1.08, 51.84, 51.84] },
  { kind: "arc", left: "77%", top: "12.1%", frame: [120, 120], image: [5.43, 33.8, 109.137, 46.843], rotate: 18 },
  { kind: "sun", left: "79%", top: "35%", frame: [132, 132], image: [5.28, 5.28, 121.44, 121.44] },
  { kind: "flower", left: "7%", top: "47.1%", frame: [176, 176], image: [10.208, 7.04, 155.584, 161.92] },
  { kind: "pentagon", left: "52%", top: "61.8%", frame: [116, 116], image: [10.44, 3.48, 97.44, 109.04], rotate: -6 },
  { kind: "ring", left: "29%", top: "78.6%", frame: [116, 116], image: [4.72, 4.64, 97.728, 106.72], rotate: -20 },
  { kind: "arch", left: "94%", top: "64.3%", frame: [58, 96.641], image: [3.87, 3.87, 50.267, 88.924], blur: true },
];

const DESKTOP_DOTS = [
  { left: "12%", top: "16.4%", size: 58 },
  { left: "37%", top: "63.6%", size: 28 },
];

// 01 홈 · 모바일 390 시안 기준이다. 양 끝 도형은 화면 가장자리에 붙도록 px로 고정한다.
const MOBILE_DECORATIONS = [
  { kind: "burst", left: "45%", top: "6.4%", frame: [54, 54], image: [1.08, 1.08, 51.84, 51.84] },
  { kind: "sun", right: -18, top: "6%", frame: [84, 84], image: [3.36, 3.36, 77.28, 77.28] },
  { kind: "flower", left: -30, top: "66%", frame: [120, 120], image: [6.96, 4.8, 106.08, 110.4] },
  { kind: "ring", right: -10, top: "78%", frame: [90, 90], image: [3.66, 3.6, 75.82, 82.8], rotate: -20 },
];

const MOBILE_DOTS = [{ left: "6%", top: "8%", size: 58 }];

export const HERO_LAYOUTS = [
  { id: "mobile", className: "lg:hidden", decorations: MOBILE_DECORATIONS, dots: MOBILE_DOTS },
  { id: "desktop", className: "hidden lg:block", decorations: DESKTOP_DECORATIONS, dots: DESKTOP_DOTS },
];
