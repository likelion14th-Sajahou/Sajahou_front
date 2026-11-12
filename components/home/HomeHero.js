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
    <section className="relative grid h-[clamp(520px,calc(100svh-var(--header-height)),920px)] w-full grid-rows-[24%_1fr] overflow-hidden bg-canvas lg:grid-rows-[30%_1fr]">
      {HERO_LAYOUTS.map(({ id, className, decorations, dots }) => (
        <HeroDecorations key={id} className={className} decorations={decorations} dots={dots} />
      ))}
      <div className="row-start-2 flex flex-col items-center">
        <div className="relative flex w-full max-w-[720px] flex-col items-center gap-4 px-6 text-center">
          <p className="text-body text-ink-soft">
            {userName} 님, 오늘은 {week}주차예요
          </p>
          <h1 className="break-keep whitespace-pre-line text-[40px] leading-[1.22] tracking-[-1.68px] text-ink sm:text-[56px]">
            {title}
          </h1>
        </div>
        <Link
          href="/retrospective"
          className="relative mt-1 flex size-[112px] shrink-0 flex-col items-center justify-center gap-2 rounded-full bg-ink text-[16px] text-white lg:absolute lg:top-[62%] lg:left-[66%] lg:mt-0 lg:size-[124px]"
        >
          {cta}
          <Image src="/images/home/arrow-down.svg" alt="" width={10.8} height={12.8} />
        </Link>
      </div>
    </section>
  );
}
