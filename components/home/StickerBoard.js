import Image from "next/image";
import Link from "next/link";
import Card from "@/components/ui/Card";
import DrawnBorder from "@/components/ui/DrawnBorder";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import TextLink from "@/components/ui/TextLink";
import SectionHeader from "./SectionHeader";
import { homeStickerHref } from "@/lib/homeViewModel";

// Figma Sticker: 셀 80px, 아이콘 영역 56px, 그림 52px, 라벨 간격 4px.
const ITEM_CLASSES = "flex size-20 flex-col items-center gap-1";
const ICON_SIZE_CLASSES = "size-14";

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
  const { kind, image, shape, color } = sticker;
  const isProject = sticker.type ? sticker.type === "project" : ["milestone", "upcoming"].includes(kind);

  if (["current", "upcoming"].includes(kind)) {
    const state = kind === "current" ? "current" : "empty";
    return (
      <span className={`flex items-center justify-center ${ICON_SIZE_CLASSES}`}>
        <Image src={`/images/home/sticker-${state}${isProject ? "-project" : ""}.svg`} alt="" width={54.0839} height={54.0839} />
      </span>
    );
  }

  // 받은 스티커는 디자인 시스템 스티커 그림이다. 그림을 정하지 못한 스티커만 도형으로 보여 준다.
  if (image) {
    return (
      <span className={`flex items-center justify-center ${ICON_SIZE_CLASSES}`}>
        <Image src={image} alt="" width={52} height={52} className="size-[52px] object-contain" />
      </span>
    );
  }

  return <span className={`flex items-center justify-center ${ICON_SIZE_CLASSES}`}><ShapeCharacter shape={shape} color={color} sticker size={52} /></span>;
}

function Sticker({ sticker }) {
  const content = (
    <>
      <StickerIcon sticker={sticker} />
      <span className={`h-[18px] w-20 text-center text-caption leading-[18px] ${["milestone", "upcoming"].includes(sticker.kind) ? "text-yellow-700" : "text-ink-subtle"}`}>
        {sticker.label}
      </span>
    </>
  );

  const link = getStickerLink(sticker);

  if (!link) {
    return <div className={ITEM_CLASSES} aria-label={`${sticker.title} 예정`}>{content}</div>;
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
        titleSize="lg"
        title={
          <>
            모은 스티커 <span className="text-yellow-700">{count}</span>
          </>
        }
        action={
          <TextLink variant="border" href="/my-record?tab=footprints">
            사자 발자국 →
          </TextLink>
        }
      />
      <div className="flex w-full flex-1 items-center justify-center py-8">
        <ul className="flex w-full max-w-[544px] flex-wrap justify-center gap-x-4 gap-y-[34px] sm:gap-x-9">
          {stickers.map((sticker) => (
            <li key={`${sticker.kind}:${sticker.week}`}>
              <Sticker sticker={sticker} />
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
