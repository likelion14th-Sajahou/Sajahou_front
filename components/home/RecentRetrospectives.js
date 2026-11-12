import Image from "next/image";
import Link from "next/link";
import { STORY_CARD_TYPES } from "@/components/my-record/storyCardTypes";
import Badge from "@/components/ui/Badge";
import DrawnBorder from "@/components/ui/DrawnBorder";
import SectionHeader from "./SectionHeader";
import { homeCardHref } from "@/lib/homeViewModel";

// 최근 회고 3개(H-20). 제목 '최근 회고 >'을 누르면 나의 사자록 스토리 카드로 간다(디자인 적용 11/12, 명세의 '전체' 링크 대신).
// 카드 모양은 Figma '최근 회고 카드': 흰 바탕, 굵은 진한 테두리, 구름 아이콘, 제목, 회고 종류 칩.
export default function RecentRetrospectives({ items }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4 pt-12">
      <SectionHeader title="최근 회고" href="/my-record?tab=cards" />
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {items.map(({ id, title, type }) => (
          <li key={id}>
            <Link
              href={homeCardHref(id)}
              className="relative flex h-full min-h-[85px] items-center gap-3 rounded-[18px] bg-white p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <DrawnBorder variant="recent-card" />
              <span aria-hidden="true" className="relative size-[26px] shrink-0 overflow-hidden">
                <Image src="/images/home/recent-retrospective.png" alt="" width={36} height={27} className="absolute top-[2px] -left-[5px] max-w-none" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
                <span className="w-full truncate text-body leading-[21px] text-ink">
                  {title}
                </span>
                <Badge tone={type === "session" ? "yellow" : STORY_CARD_TYPES[type].tone}>{STORY_CARD_TYPES[type].label}</Badge>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
