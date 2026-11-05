"use client";

import { Suspense } from "react";
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

function NavLinks({ pathname }) {
  return NAV_ITEMS.map(({ href, label }) => {
    const isActive = pathname ? isActivePath(pathname, href) : false;

    return (
      <Link
        key={href}
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={`whitespace-nowrap border-b px-0.5 py-1.5 text-body-sm ${
          isActive
            ? "border-accent text-ink"
            : "border-transparent text-ink-soft"
        }`}
      >
        {label}
      </Link>
    );
  });
}

function CurrentNavLinks() {
  return <NavLinks pathname={usePathname()} />;
}

export default function Header({ userName, userPart }) {
  return (
    <header className="w-full border-b border-transparent">
      <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-x-6 gap-y-2 p-4">
        <Link
          href="/"
          aria-label="사자록 홈"
          className="shrink-0 text-heading tracking-[-0.66px] text-ink"
        >
          사자록
        </Link>
        <nav aria-label="주요 메뉴" className="flex w-full flex-wrap items-center gap-x-4 gap-y-0.5 sm:w-auto sm:gap-5">
          {/* 동적 경로에서는 주소를 요청 시점에야 알 수 있어, 메뉴는 먼저 보여 주고 선택 표시만 나중에 채운다. */}
          <Suspense fallback={<NavLinks />}>
            <CurrentNavLinks />
          </Suspense>
          {userName && (
            <p className="hidden text-label text-ink sm:block">
              {userName} <span className="text-ink-subtle">{userPart}</span>
            </p>
          )}
        </nav>
      </div>
    </header>
  );
}
