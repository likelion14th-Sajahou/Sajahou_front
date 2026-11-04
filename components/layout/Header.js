"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/retrospective", label: "이번 주 회고" },
  { href: "/my-record", label: "나의 사자록" },
  { href: "/matching", label: "자소서 매칭" },
];

function isActivePath(pathname, href) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function Header({ userName, userPart }) {
  const pathname = usePathname();

  return (
    <header className="w-full border-b border-transparent">
      <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between gap-6 p-4">
        <Link
          href="/"
          aria-label="사자록 홈"
          className="text-heading tracking-[-0.66px] text-ink"
        >
          사자록
        </Link>
        <nav aria-label="주요 메뉴" className="flex items-center gap-5">
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive = isActivePath(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`border-b px-0.5 py-1.5 text-body-sm ${
                  isActive
                    ? "border-accent text-ink"
                    : "border-transparent text-ink-soft"
                }`}
              >
                {label}
              </Link>
            );
          })}
          {userName && (
            <p className="text-label text-ink">
              {userName} <span className="text-ink-subtle">{userPart}</span>
            </p>
          )}
        </nav>
      </div>
    </header>
  );
}
