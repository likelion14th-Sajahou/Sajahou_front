"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { HOME_HERO_CONTENT } from "@/lib/homeViewModel";
import useHeroGaze from "./useHeroGaze";

// 1440 × 839 히어로 안의 원본 별 위치. 화면 크기에 따라 위치만 비례한다.
const STARS = [
  { image: "03", x: 914, y: 187, width: 33, height: 33 },
  { image: "03", x: 1329, y: 323, width: 33, height: 33 },
  { image: "05", x: 1075, y: 120, width: 38, height: 37 },
  { image: "01", x: 1135, y: 372, width: 37, height: 36 },
  { image: "04", x: 139, y: 153, width: 35, height: 34 },
  { image: "06", x: 269, y: 273, width: 45, height: 49 },
  { image: "07", x: 378, y: 120, width: 25, height: 25 },
  { image: "07", x: 89, y: 390, width: 25, height: 25 },
  { image: "13", x: 1235, y: 243, width: 21, height: 21 },
];

// 몸통 PNG에도 눈이 있어 흰자가 기존 검은자를 덮는다.
// SVG는 반드시 배치 영역을 채워 몸통과 같은 비율로 확대·축소한다.
// CTA를 보는 원본 위치를 기본 시선으로 사용한다.
const EYES = [
  { name: "white-left", image: "white", x: 193.97, y: 169.28, size: 44.6 },
  { name: "white-right", image: "white", x: 260.01, y: 169.86, size: 44.6 },
  { name: "pupil-left", image: "pupil", x: 212.36, y: 181.9, size: 19.6 },
  { name: "pupil-right", image: "pupil", x: 278.48, y: 182.76, size: 19.6 },
];

export default function HomeHero({ userName, week, weekStatus }) {
  const characterRef = useRef(null);
  const ctaRef = useRef(null);
  useHeroGaze(characterRef, ctaRef);
  const { title, cta } = HOME_HERO_CONTENT[weekStatus];

  return (
    <section className="home-hero relative isolate w-full overflow-hidden bg-ink">
      <div aria-hidden="true" className="home-hero-stars pointer-events-none absolute inset-0">
        {STARS.map(({ image, x, y, width, height }, index) => (
          <span key={index} className="absolute" style={{ width, height, left: `${x / 14.4}%`, top: `${y / 8.39}%`, "--twinkle-duration": `${[3.6, 4.8, 6][index % 3]}s`, "--twinkle-delay": `${index * 0.8}s` }}>
            <Image src={`/images/stars/star-${image}.png`} alt="" fill sizes={`${width}px`} className="object-contain" />
          </span>
        ))}
      </div>
      <div className="home-hero-copy absolute flex w-full max-w-[720px] flex-col items-center gap-4 px-6 text-center text-white">
        <p className="text-[clamp(16px,5.48vw,24px)] leading-tight lg:leading-6">{userName} 님, 오늘은 {week}주차예요</p>
        <h1 className="font-display break-keep whitespace-pre-line text-balance text-[clamp(36px,12.8vw,56px)] leading-[1.22] tracking-[-1.5px] lg:tracking-[-1.68px]">{title}</h1>
      </div>
      <div ref={characterRef} aria-hidden="true" className="home-hero-character pointer-events-none absolute aspect-[516/392]">
        <Image src="/images/home/hero-cloud-body.png" alt="" fill sizes="(min-width: 1675px) 600px, (min-width: 1024px) 36vw, (min-width: 768px) 320px, 195px" className="object-contain" preload />
        {EYES.map(({ name, image, x, y, size }) => (
          <span key={name} data-pupil={image === "pupil" ? "" : undefined} className="absolute hidden lg:block" style={{ left: `${x / 5.16}%`, top: `${y / 3.92}%`, width: `${size / 5.16}%`, aspectRatio: 1 }}>
            <Image
              src={`/images/home/hero-eye-${image}.svg`}
              alt=""
              fill
              sizes="(min-width: 1675px) 52px, (min-width: 1024px) 3.1vw, 32px"
              className="object-contain"
            />
          </span>
        ))}
      </div>
      <Link ref={ctaRef} href="/retrospective" data-active={["NOT_STARTED", "IN_PROGRESS"].includes(weekStatus)} className="home-hero-cta flex h-[109px] w-28 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:h-[153px] md:w-[157px] lg:absolute lg:h-[167px] lg:w-[172px]">
        <span className="home-hero-cta-content relative flex size-full items-center justify-center">
          <Image src="/images/home/cta-flower.png" alt="" fill sizes="(min-width: 1024px) 172px, (min-width: 768px) 157px, 112px" className="object-contain" />
          <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap font-display text-[14.208px] leading-[25.6px] tracking-[-0.15px] text-ink-strong">
            {cta}<Image src="/images/home/cta-chevron-right.svg" alt="" width={16} height={16} className="shrink-0 -translate-y-[2px]" />
          </span>
        </span>
      </Link>
    </section>
  );
}
