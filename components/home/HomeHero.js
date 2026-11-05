import Image from "next/image";
import Link from "next/link";
import HeroDecoration from "./HeroDecoration";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import { HERO_LAYOUTS } from "./heroDecorations";

const HERO_CONTENT = {
  default: { title: "이번 주 이야기를\n남겨 볼까요", cta: "회고 쓰기" },
  draft: { title: "이번 주 이야기를\n남겨 볼까요", cta: "이어 쓰기" },
  rest: { title: "이번 주는\n쉬어 가는 주예요", cta: "이번 주 보기" },
};

function HeroDecorations({ className, decorations, dots }) {
  return (
    <div aria-hidden="true" className={className}>
      {decorations.map(({ kind, left, right, top, frame, image, rotate, blur }) => (
        <div
          key={kind}
          className="absolute"
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
  const { title, cta } = HERO_CONTENT[weekStatus];

  return (
    <section className="relative h-[732px] w-full overflow-hidden bg-canvas lg:h-[832px]">
      {HERO_LAYOUTS.map(({ id, className, decorations, dots }) => (
        <HeroDecorations key={id} className={className} decorations={decorations} dots={dots} />
      ))}
      <div className="absolute inset-x-0 top-[24%] mx-auto flex max-w-[720px] flex-col items-center gap-4 px-6 text-center lg:top-[30%]">
        <p className="text-body text-ink-soft">
          {userName} 님, 오늘은 {week}주차예요
        </p>
        <h1 className="break-keep whitespace-pre-line text-[56px] leading-[68.32px] tracking-[-1.68px] text-ink">
          {title}
        </h1>
      </div>
      <Link
        href="/retrospective"
        className="absolute top-[58%] left-1/2 flex size-[112px] -translate-x-1/2 flex-col items-center justify-center gap-2 rounded-full bg-ink text-[16px] text-white lg:top-[62%] lg:left-[66%] lg:size-[124px] lg:translate-x-0"
      >
        {cta}
        <Image src="/images/home/arrow-down.svg" alt="" width={10.8} height={12.8} />
      </Link>
    </section>
  );
}
