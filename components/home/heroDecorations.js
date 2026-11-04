// frame은 히어로 영역 기준 위치·크기, image는 frame 안에서 SVG가 놓이는 위치다(시안 좌표).
// 회전은 시안과 같이 frame 중심을 기준으로 한다.
export const HERO_IMAGES = [
  { src: "/images/home/hero-ticket.svg", left: "-2%", top: "23.2%", frame: [96, 57.594], image: [3.84, 5.76, 88.32, 46.075], rotate: -24, blur: true },
  { src: "/images/home/hero-dome.svg", left: "21%", top: "8.9%", frame: [156, 156], image: [6.24, 15.6, 143.52, 71.76], rotate: -32 },
  { src: "/images/home/hero-burst.svg", left: "45%", top: "6.4%", frame: [54, 54], image: [1.08, 1.08, 51.84, 51.84] },
  { src: "/images/home/hero-arc.svg", left: "77%", top: "12.1%", frame: [120, 120], image: [5.43, 33.8, 109.137, 46.843], rotate: 18 },
  { src: "/images/home/hero-sun.svg", left: "79%", top: "35%", frame: [132, 132], image: [5.28, 5.28, 121.44, 121.44] },
  { src: "/images/home/hero-flower.svg", left: "7%", top: "47.1%", frame: [176, 176], image: [10.208, 7.04, 155.584, 161.92] },
  { src: "/images/home/hero-pentagon.svg", left: "52%", top: "61.8%", frame: [116, 116], image: [10.44, 3.48, 97.44, 109.04], rotate: -6 },
  { src: "/images/home/hero-ring.svg", left: "29%", top: "78.6%", frame: [116, 116], image: [4.72, 4.64, 97.728, 106.72], rotate: -20 },
  { src: "/images/home/hero-arch.svg", left: "94%", top: "64.3%", frame: [58, 96.641], image: [3.87, 3.87, 50.267, 88.924], blur: true },
];

export const HERO_DOTS = [
  { left: "12%", top: "16.4%", size: 58 },
  { left: "37%", top: "63.6%", size: 28 },
];
