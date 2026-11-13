import Link from "next/link";
import { recordHref } from "@/lib/myRecordNavigation";

const TABS = [
  { id: "footprints", label: "사자 발자국", href: "/my-record" },
  { id: "cards", label: "스토리 카드", href: "/my-record?tab=cards" },
];

export default function MyRecordTabs({ activeTab, storyCardCount, searchParams }) {
  return (
    <nav aria-label="나의 사자록 메뉴" className="mt-3 flex gap-1 border-b border-line font-display">
      {TABS.map(({ id, label }) => {
        const isActive = id === activeTab;

        return (
          <Link
            key={id}
            href={recordHref(searchParams, { tab: id, card: null, highlight: null })}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={`-mb-px border-b-2 px-3.5 py-2.5 text-body ${
              isActive ? "border-accent text-ink" : "border-transparent text-ink-subtle"
            }`}
          >
            {label}
            {id === "cards" && (
              <span className="text-accent"> {storyCardCount}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
