import Image from "next/image";
import Link from "next/link";
import Card from "@/components/ui/Card";
import DrawnBorder from "@/components/ui/DrawnBorder";
import TextLink from "@/components/ui/TextLink";
import SectionHeader from "./SectionHeader";
import { homeStickerHref } from "@/lib/homeViewModel";
import { selectBoardStickers } from "@/lib/selectBoardStickers";

// Figma Sticker: 셀 80px, 아이콘 영역 56px, 그림 52px, 라벨 간격 4px.
const ITEM_CLASSES = "flex h-20 w-16 flex-col items-center gap-1 min-[390px]:w-20";
const ICON_SIZE_CLASSES = "size-14";

function Sticker({ sticker }) {
  return (
    <Link href={homeStickerHref(sticker)} aria-label={`${sticker.week}주차 ${sticker.title} 스티커`} className={ITEM_CLASSES}>
      <span className={`flex items-center justify-center ${ICON_SIZE_CLASSES}`}>
        <Image src={sticker.image} alt="" width={52} height={52} className="size-[52px] object-contain" />
      </span>
      <span className={`h-[18px] w-20 text-center text-caption leading-[18px] ${sticker.kind === "milestone" ? "text-yellow-700" : "text-ink-subtle"}`}>
        {sticker.label}
      </span>
    </Link>
  );
}

export default function StickerBoard({ count, stickers }) {
  // 데스크톱의 10개에서 다시 선택해 프로젝트는 유지하고 가장 오래된 일반 스티커만 뺀다.
  // CSS로 표시를 바꿔 화면 크기 감지 상태나 중복 목록 없이 모바일·태블릿에는 9개를 보여 준다.
  const mobileWeeks = new Set(selectBoardStickers(stickers, 9).map(({ week }) => week));

  return (
    <Card as="section" className="relative flex min-w-0 flex-col items-center gap-4 p-6! lg:min-h-[550px]">
      <DrawnBorder color="var(--color-ink-300)" />
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
        {stickers.length === 0 ? (
          <p className="text-body text-ink-subtle">회고를 완료하면 스티커가 모여요.</p>
        ) : <ul className="grid w-full max-w-[544px] grid-cols-3 justify-items-center gap-x-2 gap-y-4 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-9 sm:gap-y-[34px]">
          {stickers.map((sticker) => (
            <li key={`${sticker.kind}:${sticker.week}`} className={mobileWeeks.has(sticker.week) ? undefined : "hidden lg:list-item"}>
              <Sticker sticker={sticker} />
            </li>
          ))}
        </ul>}
      </div>
    </Card>
  );
}
