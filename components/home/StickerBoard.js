import Image from "next/image";
import Link from "next/link";
import Card from "@/components/ui/Card";
import DrawnBorder from "@/components/ui/DrawnBorder";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import TextLink from "@/components/ui/TextLink";
import SectionHeader from "./SectionHeader";
import { homeStickerHref } from "@/lib/homeViewModel";

// 스티커 한 칸(Figma 'Sticker'): 그림 88px + 아래 이름 12px. 상태는 받음(earned·milestone), 이번 주(current), 빈 자리(upcoming).
const ITEM_CLASSES = "flex w-full flex-col items-center gap-2";
const ICON_SIZE_CLASSES = "size-[60px] md:size-[88px]";

// 스티커별 이동 경로와 화면 낭독기용 이름이다. 중커톤처럼 아직 받지 않은 스티커는 누를 수 없다.
function getStickerLink({ kind, week, title }) {
  if (kind === "current") {
    return { href: "/retrospective", label: `${week}주차 회고 쓰고 스티커 받기` };
  }

  if (kind === "upcoming") {
    return null;
  }

  return { href: homeStickerHref({ kind, week }), label: `${week}주차 ${title} 스티커` };
}

function StickerIcon({ sticker }) {
  const { kind, title, image, shape, color } = sticker;

  if (kind === "current") {
    return (
      <span className={`flex items-center justify-center ${ICON_SIZE_CLASSES}`}>
        <Image src="/images/home/sticker-current.svg" alt="" width={79.3} height={79.3} className="size-[90%]" />
      </span>
    );
  }

  if (kind === "upcoming") {
    return (
      <span className={`flex items-center justify-center ${ICON_SIZE_CLASSES}`}>
        <Image src="/images/home/sticker-empty.svg" alt={`${title} 예정`} width={79.3} height={79.3} className="size-[90%]" />
      </span>
    );
  }

  // 받은 스티커는 디자인 시스템 스티커 그림이다. 그림을 정하지 못한 스티커만 도형으로 보여 준다.
  if (image) {
    return (
      <span className={`relative flex items-center justify-center ${ICON_SIZE_CLASSES}`}>
        <Image src={image} alt="" fill sizes="(min-width: 768px) 82px, 56px" className="object-contain p-[4%]" />
      </span>
    );
  }

  return <ShapeCharacter shape={shape} color={color} sticker className={ICON_SIZE_CLASSES} />;
}

function Sticker({ sticker }) {
  const content = (
    <>
      <StickerIcon sticker={sticker} />
      <span className={`text-caption leading-[18px] ${["milestone", "upcoming"].includes(sticker.kind) ? "text-yellow-700" : "text-ink-subtle"}`}>
        {sticker.label}
      </span>
    </>
  );

  const link = getStickerLink(sticker);

  if (!link) {
    return <div className={ITEM_CLASSES}>{content}</div>;
  }

  return (
    <Link href={link.href} aria-label={link.label} className={ITEM_CLASSES}>
      {content}
    </Link>
  );
}

export default function StickerBoard({ count, stickers }) {
  return (
    <Card as="section" className="relative flex min-w-0 flex-col items-center gap-4 p-6! lg:min-h-[550px]">
      <DrawnBorder variant="sticker-board" />
      <SectionHeader
        title={
          <>
            <span className="text-[24px]">모은 스티커 <span className="text-yellow-700">{count}</span></span>
          </>
        }
        action={
          <TextLink variant="border" size="sm" href="/my-record?tab=footprints">
            사자 발자국 →
          </TextLink>
        }
      />
      <ul className="grid w-full max-w-[618px] flex-1 grid-cols-3 content-center gap-x-2 gap-y-8 py-8 sm:grid-cols-5 sm:gap-x-3 md:gap-y-12">
        {stickers.map((sticker) => (
          <li key={`${sticker.kind}:${sticker.week}`}>
            <Sticker sticker={sticker} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
