"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMockData } from "@/components/layout/MockDataProvider";
import { useAuth } from "./AuthProvider";
import TextLink from "@/components/ui/TextLink";

const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/retrospective", label: "이번 주 회고" },
  // 프로젝트 상세(/projects/[id])에서도 선택된 것으로 표시한다(H-01).
  { href: "/projects", label: "프로젝트" },
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

export default function Header() {
  const { user } = useMockData();
  const { isAuthenticated, restoreStatus, logout, isLoggingOut, isAccountBusy, logoutError } = useAuth();

  // 768px 미만은 두 줄: 첫 줄에 로고와 사용자(로그아웃), 둘째 줄에 메뉴. 768px 이상은 한 줄(15 시안).
  // 홈 히어로가 이 높이(두 줄 110px, 한 줄 68px)를 빼서 첫 화면을 채우므로, 줄 수를 바꾸면 HomeHero도 함께 고친다.
  return (
    <header className="w-full border-b border-transparent">
      <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-x-5 gap-y-2 p-4">
        <Link
          href="/"
          aria-label="사자록 홈"
          className="shrink-0 text-heading tracking-[-0.66px] text-ink"
        >
          사자록
        </Link>
        <nav aria-label="주요 메뉴" className="order-last flex w-full flex-wrap items-center gap-x-4 gap-y-0.5 sm:gap-5 md:order-none md:ml-auto md:w-auto">
          {/* 동적 경로에서는 주소를 요청 시점에야 알 수 있어, 메뉴는 먼저 보여 주고 선택 표시만 나중에 채운다. */}
          <Suspense fallback={<NavLinks />}>
            <CurrentNavLinks />
          </Suspense>
        </nav>
        {/* 모바일에서는 이름·파트를 숨기고 로그아웃만 보여 준다(H-01). */}
        <div className="flex items-center gap-2">
          {restoreStatus === "checking" && <p role="status" className="text-label text-ink-subtle">로그인 확인 중…</p>}
          {isAuthenticated && user && (
            <p className="hidden text-label text-ink sm:block">
              {user.name} <span className="text-ink-subtle">{user.part}</span>
            </p>
          )}
          {isAuthenticated && (
            <TextLink
              size="sm"
              onClick={logout}
              disabled={isAccountBusy}
              aria-busy={isAccountBusy}
              aria-describedby={logoutError ? "logout-error" : undefined}
              className="text-ink-subtle disabled:cursor-default disabled:opacity-60"
            >
              {isLoggingOut ? "로그아웃 중…" : "로그아웃"}
            </TextLink>
          )}
        </div>
        {logoutError && <p id="logout-error" role="alert" className="w-full text-label text-error">{logoutError}</p>}
      </div>
    </header>
  );
}
