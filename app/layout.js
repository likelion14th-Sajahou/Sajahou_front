import { Suspense } from "react";
import MockDataProvider from "@/components/layout/MockDataProvider";
import AuthProvider from "@/components/layout/AuthProvider";
import ScrollToTopOnNavigate from "@/components/layout/ScrollToTopOnNavigate";
import { displayFont, notoSansKr, npsFont } from "./fonts";
import "./globals.css";

export const metadata = {
  title: "사자록",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ko"
      className={`${npsFont.variable} ${displayFont.variable} ${notoSansKr.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <ScrollToTopOnNavigate />
        </Suspense>
        {/* 공유 데이터는 모든 화면(서비스·로그인)이 함께 쓰도록 하나의 루트 레이아웃에 둔다.
            그룹마다 루트 레이아웃을 따로 만들면 그룹 사이를 오갈 때 페이지 전체가 새로 불러와져 데이터가 초기화된다. */}
        <AuthProvider><MockDataProvider>{children}</MockDataProvider></AuthProvider>
      </body>
    </html>
  );
}
