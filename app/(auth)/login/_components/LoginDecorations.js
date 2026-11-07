import Image from "next/image";

// 원본 Icon의 여백과 회전을 유지한다. SVG 자체는 내보낸 크기로 렌더링한다.
const DECORATIONS = [
  { asset: "854f1", x: 45.8, y: 45.8, size: 110, insetX: 4.4, insetY: 4.4, width: 101.2, height: 101.2 },
  { asset: "1b267", x: 250.59, y: 20.19, size: 46, rotate: 12, insetX: 2.76, insetY: 3.68, width: 40.48, height: 37.72 },
  { asset: "3829e", x: 184, y: 241.59, size: 64, rotate: -10, insetX: 5.12, insetY: 5.12, width: 53.76, height: 53.76 },
  { asset: "18764", x: 17.6, y: 377.6, size: 80, rotate: 8, insetX: 4.8, insetY: 27.2, width: 70.4, height: 35.2 },
  { asset: "e9d6d", x: 259, y: 475, size: 58, rotate: -6, insetX: 5.22, insetY: 2.9, width: 48.72, height: 53.36 },
  { asset: "2b8cf", x: 77.59, y: 552.8, size: 104, insetX: 3.848, insetY: 3.12, width: 96.304, height: 97.76 },
  { asset: "ff49c", x: 359.39, y: 633, size: 30, insetX: 1.2, insetY: 1.2, width: 27.6, height: 27.6 },
  { asset: "78cfd", x: 377.8, y: 161.8, size: 22, insetX: 0.88, insetY: 0.88, width: 20.24, height: 20.24 },
  { asset: "83b6b", x: 1161.59, y: 24, size: 96, rotate: -12, insetX: 5.76, insetY: 32.64, width: 84.48, height: 42.24 },
  { asset: "bd5ca", x: 1034.19, y: 26.19, size: 34, insetX: 1.36, insetY: 1.36, width: 31.28, height: 31.28 },
  { asset: "572d0", x: 1232.19, y: 209.8, size: 70, rotate: 14, insetX: 4.2, insetY: 5.6, width: 61.6, height: 57.4 },
  { asset: "e61e7", x: 1069.39, y: 306.19, size: 50, insetX: 1.85, insetY: 1.5, width: 46.3, height: 47 },
  { asset: "2a7e9", x: 1282.39, y: 404, size: 56, rotate: 10, insetX: 4.48, insetY: 4.48, width: 47.04, height: 47.04 },
  { asset: "6bee6", x: 1079.19, y: 517.6, size: 88, rotate: 8, insetX: 7.92, insetY: 4.4, width: 73.92, height: 80.96 },
  { asset: "a6582", x: 1276, y: 613.59, size: 40, insetX: 1.6, insetY: 1.6, width: 36.8, height: 36.8 },
  { asset: "07fc0", x: 1005.39, y: 645.39, size: 34, rotate: -8, insetX: 2.04, insetY: 2.72, width: 29.92, height: 27.88 },
];

export default function LoginDecorations() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {DECORATIONS.map(({ asset, x, y, size, rotate = 0, insetX, insetY, width, height }) => (
        <div
          key={asset}
          className="absolute scale-60 sm:scale-80 lg:scale-100"
          style={{ left: `${(x / 1440) * 100}%`, top: `${(y / 720) * 100}%` }}
        >
          <div style={{ width: size, height: size, transform: `rotate(${rotate}deg)` }}>
            <Image
              src={`/images/login/${asset}.svg`}
              alt=""
              width={width}
              height={height}
              unoptimized
              className="absolute max-w-none"
              style={{ left: insetX, top: insetY, width, height }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
