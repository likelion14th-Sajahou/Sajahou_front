import Image from "next/image";
import Link from "next/link";
import HeroDecoration from "./HeroDecoration";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import { HERO_LAYOUTS } from "./heroDecorations";
import { HOME_HERO_CONTENT } from "@/lib/homeViewModel";

function HeroDecorations({ className, decorations, dots }) {
  return (
    <div aria-hidden="true" className={`absolute inset-0 ${className}`}>
      {decorations.map(({ kind, left, right, top, frame, image, rotate, blur }) => (
        <div
          key={kind}
          className="home-hero-float absolute"
          style={{
            left,
            right,
            top,
            width: frame[0],
            height: frame[1],
            rotate: rotate ? `${rotate}deg` : undefined,
            filter: blur ? "blur(3px)" : undefined,
          }}
        >
          <HeroDecoration
            kind={kind}
            width={image[2]}
            height={image[3]}
            className="absolute max-w-none"
            style={{ left: image[0], top: image[1] }}
          />
        </div>
      ))}
      {dots.map(({ left, top, size }) => (
        <div key={left} className="absolute" style={{ left, top }}>
          <ShapeCharacter shape="circle" color="yellow" face="none" size={size} />
        </div>
      ))}
    </div>
  );
}

export default function HomeHero({ userName, week, weekStatus }) {
  const { title, cta } = HOME_HERO_CONTENT[weekStatus];

  return (
    // 첫 화면에 히어로만 보이도록 헤더 높이(globals.css의 --header-height)를 뺀 값을 쓴다.
    // 진한 배경(ink-900) 위에 흰 인사말·제목(Figma 'Hero 인사말'·'Hero 제목'). 배경 장식은 히어로 화면 디자인 때 바꾼다.
    <section className="relative grid h-[clamp(520px,calc(100svh-var(--header-height)),920px)] w-full grid-rows-[24%_1fr] overflow-hidden bg-ink-900 lg:grid-rows-[30%_1fr]">
      {HERO_LAYOUTS.map(({ id, className, decorations, dots }) => (
        <HeroDecorations key={id} className={className} decorations={decorations} dots={dots} />
      ))}
      <div className="row-start-2 flex flex-col items-center">
        <div className="relative flex w-full max-w-[720px] flex-col items-center gap-4 px-6 text-center text-white">
          <p className="text-[20px] leading-6 sm:text-[24px]">
            {userName} 님, 오늘은 {week}주차예요
          </p>
          <h1 className="font-display break-keep whitespace-pre-line text-balance text-[40px] leading-[1.22] tracking-[-1.68px] sm:text-[56px]">
            {title}
          </h1>
        </div>
        {/* 회고 CTA(Figma '회고 CTA 버튼'): 꽃 모양 스티커 위에 상태별 문구와 '>' */}
        <Link
          href="/retrospective"
          className="relative mt-1 flex h-[153px] w-[157px] shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:absolute lg:top-[60%] lg:left-[66%] lg:mt-0"
        >
          <Image src="/images/home/cta-flower.png" alt="" fill sizes="157px" className="object-contain" />
          <span className="relative flex items-center gap-1 pl-1.5 font-display text-[16px] leading-[25.6px] text-ink">
            {cta}
            <Image src="/images/common/chevron-right-16.svg" alt="" width={16} height={16} />
          </span>
        </Link>
      </div>
    </section>
  );
}
