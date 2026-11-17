import Image from "next/image";
import Link from "next/link";
import DrawnBorder from "@/components/ui/DrawnBorder";
import { recordHref } from "@/lib/myRecordNavigation";

// 아이콘은 탭이 켜졌을 때(색)와 꺼졌을 때(회색) 두 가지다(11/15 디자인).
const TABS = [
  { id: "footprints", label: "사자 발자국", icon: "tab-footprints" },
  { id: "cards", label: "스토리 카드", icon: "tab-cards" },
];

export default function MyRecordTabs({ activeTab, storyCardCount, searchParams }) {
  return (
    <nav aria-label="나의 사자록 메뉴" className="mt-3 flex flex-wrap gap-2 font-display sm:gap-2.5">
      {TABS.map(({ id, label, icon }) => {
        const isActive = id === activeTab;

        return (
          <Link
            key={id}
            href={recordHref(searchParams, { tab: id, card: null, highlight: null })}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={`relative flex h-[42px] items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1.5 text-body-sm leading-[27.2px] min-[390px]:gap-2 min-[390px]:pr-4 min-[390px]:pl-3 min-[390px]:text-[17px] sm:h-[50px] sm:pr-[22px] ${
              isActive ? "bg-white text-ink-strong shadow-[0_3px_0_var(--color-line)]" : "text-ink-300 hover:text-ink-500"
            }`}
          >
            {/* 선택된 탭은 나의 사자록 카드와 같은 2px 물결 선이다(이슈 #65). */}
            {isActive && <DrawnBorder color="var(--color-ink)" width={2} />}
            <Image src={`/images/my-record/${icon}-${isActive ? "on" : "off"}.png`} alt="" width={34} height={34} className="size-7 shrink-0 min-[390px]:size-[30px] sm:size-[34px]" />
            {label}
            {id === "cards" && (
              <span className="ml-0.5 rounded-full bg-yellow-200 px-2 text-[13px] leading-[22px] text-yellow-700">{storyCardCount}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
