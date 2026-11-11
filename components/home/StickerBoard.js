"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Card from "@/components/ui/Card";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import TextLink from "@/components/ui/TextLink";
import SectionHeader from "./SectionHeader";
import { homeStickerHref } from "@/lib/homeViewModel";

const LABEL_CLASSES = {
  earned: "text-ink-muted",
  milestone: "text-tint-yellow-ink",
  current: "text-accent-strong",
  upcoming: "text-ink-muted",
};

const ITEM_CLASSES = "flex w-[72px] flex-col items-center gap-1 md:w-[92px]";
const ICON_SIZE_CLASSES = "size-[54px] md:size-[70px]";

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
  const { kind, title, shape, color } = sticker;

  if (kind === "current") {
    return (
      <span className={`flex items-center justify-center ${ICON_SIZE_CLASSES}`}>
        <Image src="/images/home/sticker-add.svg" alt="" width={58.982} height={58.982} className="size-[84.26%]" />
      </span>
    );
  }

  if (kind === "upcoming") {
    return (
      <span className={`flex items-center justify-center ${ICON_SIZE_CLASSES}`}>
        <Image src="/images/home/sticker-upcoming.svg" alt={`${title} 예정`} width={62.892} height={62.892} className="size-[89.85%]" />
      </span>
    );
  }

  return (
    <ShapeCharacter
      shape={shape}
      color={color}
      sticker
      className={ICON_SIZE_CLASSES}
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

function StickerList({ stickers, label }) {
  if (!stickers.length) return null;
  return (
    <ul aria-label={label} className="flex w-full flex-wrap content-center justify-center gap-x-2 gap-y-5">
      {stickers.map((sticker) => (
        <li key={`${sticker.kind}:${sticker.week}`}><Sticker sticker={sticker} /></li>
      ))}
    </ul>
  );
}

export default function StickerBoard({ count, stickers }) {
  const weekStickers = stickers.filter((item) => item.kind !== "milestone" && item.kind !== "upcoming");
  const projectStickers = stickers.filter((item) => item.kind === "milestone" || item.kind === "upcoming");
  const board = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    });
    observer.observe(board.current);
    return () => observer.disconnect();
  }, []);
  return (
    <Card as="section" className="flex flex-col items-center gap-3.5">
      <SectionHeader
        title={
          <>
            모은 스티커 <span className="text-accent-strong">{count}</span>
          </>
        }
        action={
          <TextLink variant="border" size="sm" href="/my-record?tab=footprints">
            사자 발자국 →
          </TextLink>
        }
      />
      <div ref={board} className={`flex w-full max-w-[620px] flex-1 flex-col items-center justify-center gap-5 ${visible ? "home-stickers-enter" : ""}`}>
        <StickerList stickers={weekStickers} label="주차 스티커" />
        <StickerList stickers={projectStickers} label="프로젝트 스티커" />
      </div>
    </Card>
  );
}
