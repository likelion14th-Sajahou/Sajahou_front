"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Next.js는 새 페이지의 시작 지점이 화면에 보이면 스크롤을 유지한다.
// 긴 페이지에서 짧은 페이지로 이동하면 스크롤이 조금 남아 헤더가 잘리므로, 이동할 때 맨 위로 올린다.
// 뒤로 가기·앞으로 가기는 이전 스크롤 위치를 복원해야 하므로 제외한다.
export default function ScrollToTopOnNavigate() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const isHistoryNavigation = useRef(false);

  useEffect(() => {
    const markHistoryNavigation = () => {
      isHistoryNavigation.current = true;
    };

    window.addEventListener("popstate", markHistoryNavigation);
    return () => window.removeEventListener("popstate", markHistoryNavigation);
  }, []);

  useLayoutEffect(() => {
    if (previousPathname.current === pathname) {
      return;
    }

    previousPathname.current = pathname;

    if (isHistoryNavigation.current) {
      isHistoryNavigation.current = false;
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
