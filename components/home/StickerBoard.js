import Image from "next/image";
import Link from "next/link";
import Card from "@/components/ui/Card";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import TextLink from "@/components/ui/TextLink";
import SectionHeader from "./SectionHeader";

const LABEL_CLASSES = {
  earned: "text-ink-muted",
  milestone: "text-tint-yellow-ink",
  current: "text-accent-strong",
  upcoming: "text-ink-muted",
};

const ITEM_CLASSES = "flex w-[92px] flex-col items-center gap-1";

function StickerIcon({ sticker }) {
  const { kind, week, title, shape, color } = sticker;

  if (kind === "current") {
    return (
      <span className="flex size-[70px] items-center justify-center">
        <Image src="/images/home/sticker-add.svg" alt="" width={58.982} height={58.982} />
      </span>
    );
  }

  if (kind === "upcoming") {
    return (
      <span className="flex size-[70px] items-center justify-center">
        <Image src="/images/home/sticker-upcoming.svg" alt={`${title} 예정`} width={62.892} height={62.892} />
      </span>
    );
  }

  return (
    <ShapeCharacter
      shape={shape}
      color={color}
      sticker
      label={`${week}주차 ${title} 스티커`}
    />
  );
}

function Sticker({ sticker }) {
  const content = (
    <>
      <StickerIcon sticker={sticker} />
      <span className={`text-badge ${LABEL_CLASSES[sticker.kind]}`}>
        {sticker.label}
      </span>
    </>
  );

  if (sticker.kind === "current") {
    return (
      <Link
        href="/retrospective"
        aria-label={`${sticker.week}주차 회고 쓰고 스티커 받기`}
        className={ITEM_CLASSES}
      >
        {content}
      </Link>
    );
  }

  return <div className={ITEM_CLASSES}>{content}</div>;
}

export default function StickerBoard({ count, stickers }) {
  return (
    <Card as="section" className="flex flex-col items-center gap-3.5">
      <SectionHeader
        title={
          <>
            모은 스티커 <span className="text-accent-strong">{count}</span>
          </>
        }
        action={
          <TextLink variant="border" size="sm" href="/my-record">
            사자 발자국 →
          </TextLink>
        }
      />
      <ul className="flex w-full max-w-[620px] flex-1 flex-wrap content-center justify-center gap-x-2 gap-y-5">
        {stickers.map((sticker) => (
          <li key={sticker.label}>
            <Sticker sticker={sticker} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
