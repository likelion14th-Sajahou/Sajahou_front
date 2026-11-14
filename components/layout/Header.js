"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMockData } from "@/components/layout/MockDataProvider";
import { useAuth } from "./AuthProvider";
import TextLink from "@/components/ui/TextLink";
import Toast, { useToast } from "@/components/ui/Toast";
import ProfileModal from "@/components/profile/ProfileModal";

const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/retrospective", label: "이번 주 회고" },
  { href: "/projects", label: "프로젝트" },
  { href: "/my-record", label: "나의 사자록" },
  { href: "/matching", label: "자소서 매칭" },
];

function isActivePath(pathname, href) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

// 메뉴 탭(Figma 'Nav Tab'). 선택된 탭 아래에 노란 마커를 표시한다.
function NavLinks({ pathname }) {
  return NAV_ITEMS.map(({ href, label }) => {
    const isActive = pathname ? isActivePath(pathname, href) : false;

    return (
      <Link
        key={href}
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={`relative isolate whitespace-nowrap border-b-2 py-1.5 text-body-sm leading-[22.4px] font-bold ${
          isActive
            ? "border-transparent text-ink after:absolute after:-inset-x-[5px] after:bottom-1.5 after:-z-10 after:h-2.5 after:rounded-[5px] after:bg-yellow-400"
            : "border-transparent text-ink-subtle"
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
  // 이름(모바일은 '내 정보')을 누르면 내 정보 수정 팝업을 연다. 닫으면 누른 버튼으로 포커스를 돌려준다.
  const [profileOpen, setProfileOpen] = useState(false);
  const profileOpener = useRef(null);
  const { toast, showToast, hideToast } = useToast();

  function openProfile(event) {
    profileOpener.current = event.currentTarget;
    setProfileOpen(true);
  }

  // 팝업이 열린 동안에는 바깥이 막혀 있어서, 팝업이 사라진 뒤에 포커스를 옮긴다.
  useEffect(() => {
    if (!profileOpen) profileOpener.current?.focus();
  }, [profileOpen]);

  // 화면 위에 고정되는 반투명 헤더(Figma 'Header'). 1024px 미만은 두 줄: 첫 줄에 로고와 사용자(로그아웃), 둘째 줄에 메뉴. 1024px 이상은 한 줄.
  // 홈 히어로가 이 높이를 빼서 첫 화면을 채우고, 스크롤 위치도 이 높이만큼 띄운다(globals.css의 --header-height).
  // 줄 수나 높이를 바꾸면 --header-height도 함께 고친다.
  return (
    <>
    <header className="sticky top-0 z-40 min-h-[var(--header-height)] w-full border-b border-transparent bg-canvas/80 backdrop-blur-[8px]">
      <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-x-6 gap-y-2 p-4">
        <Link href="/" aria-label="사자록 홈" className="shrink-0">
          <Image src="/images/brand/logo.png" alt="" width={117} height={42} priority />
        </Link>
        <nav aria-label="주요 메뉴" className="order-last flex w-full flex-wrap items-center gap-x-4 gap-y-0.5 sm:gap-6 lg:order-none lg:ml-auto lg:w-auto">
          {/* 동적 경로에서는 주소를 요청 시점에야 알 수 있어, 메뉴는 먼저 보여 주고 선택 표시만 나중에 채운다. */}
          <Suspense fallback={<NavLinks />}>
            <CurrentNavLinks />
          </Suspense>
        </nav>
        {/* 메뉴와 사용자 정보 사이 구분선 (한 줄일 때만) */}
        {isAuthenticated && <span aria-hidden="true" className="hidden h-4 w-px bg-locked lg:block" />}
        {/* 모바일에서는 이름·파트 대신 내 정보 링크를 보여 준다. */}
        <div className="flex items-center gap-2 sm:gap-4">
          {restoreStatus === "checking" && <p role="status" className="text-label text-ink-subtle">로그인 확인 중…</p>}
          {isAuthenticated && user && (
            <>
              <div className="hidden min-w-0 items-center gap-1 text-body-sm leading-[20.8px] font-bold text-ink sm:flex">
                <button type="button" aria-haspopup="dialog" aria-label={`${user.name} 님 내 정보 수정`} onClick={openProfile} className="max-w-[120px] cursor-pointer truncate rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink hover:underline">
                  {user.name}
                </button>
                <span className="whitespace-nowrap text-ink-500">{user.part}</span>
              </div>
              <TextLink variant="underline" size="sm" aria-haspopup="dialog" onClick={openProfile} className="sm:hidden">내 정보</TextLink>
            </>
          )}
          {isAuthenticated && (
            <TextLink
              variant="underline"
              size="sm"
              onClick={logout}
              disabled={isAccountBusy}
              aria-busy={isAccountBusy}
              aria-describedby={logoutError ? "logout-error" : undefined}
              className="leading-5 disabled:cursor-default disabled:opacity-60"
            >
              {isLoggingOut ? "로그아웃 중…" : "로그아웃"}
            </TextLink>
          )}
        </div>
        {logoutError && <p id="logout-error" role="alert" className="w-full text-label text-error">{logoutError}</p>}
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-[2px] left-0 h-[4px] w-full bg-[url(/images/home/header-line.svg)] bg-[length:100%_100%] bg-no-repeat" />
    </header>
    {/* 헤더의 흐림 효과(backdrop-filter) 안에 두면 고정 위치 토스트가 헤더 기준으로 놓여서 헤더 밖에 둔다. */}
    {isAuthenticated && profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} onSaved={showToast} />}
    <Toast toast={toast} onDismiss={hideToast} />
    </>
  );
}
