import Link from "next/link";

const TABS = [
  { id: "footprints", label: "사자 발자국", href: "/my-record" },
  { id: "cards", label: "스토리 카드", href: "/my-record?tab=cards" },
];

export default function MyRecordTabs({ activeTab, storyCardCount }) {
  return (
    <nav aria-label="나의 사자록 메뉴" className="mt-3 flex gap-1 border-b border-line">
      {TABS.map(({ id, label, href }) => {
        const isActive = id === activeTab;

        return (
          <Link
            key={id}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`-mb-px border-b-2 px-3.5 py-2.5 text-body ${
              isActive ? "border-accent text-ink" : "border-transparent text-ink-subtle"
            }`}
          >
            {label}
            {id === "cards" && (
              <span className="text-accent-strong"> {storyCardCount}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
