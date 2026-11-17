import { Suspense } from "react";
import AppDataProvider from "@/components/layout/AppDataProvider";
import AuthProvider from "@/components/layout/AuthProvider";
import ScrollToTopOnNavigate from "@/components/layout/ScrollToTopOnNavigate";
import { displayFont, npsFont, pretendardFont } from "./fonts";
import "./globals.css";

const DESCRIPTION = "멋쟁이사자처럼 활동에서 쌓은 경험을 회고하고, 스토리 카드로 모아 포트폴리오와 자기소개서 작성에 활용하는 서비스";

// 링크 미리보기 이미지의 절대 주소는 Vercel 배포 주소로 자동으로 채워진다(metadataBase 생략).
export const metadata = {
  title: "사자록",
  description: DESCRIPTION,
  openGraph: {
    title: "사자록",
    description: DESCRIPTION,
    siteName: "사자록",
    locale: "ko_KR",
    type: "website",
    images: [{ url: "/images/characters/cloud-shooting-star.png", width: 820, height: 615, alt: "사자록" }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ko"
      className={`${npsFont.variable} ${displayFont.variable} ${pretendardFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <ScrollToTopOnNavigate />
        </Suspense>
        {/* 공유 데이터는 모든 화면(서비스·로그인)이 함께 쓰도록 하나의 루트 레이아웃에 둔다.
            그룹마다 루트 레이아웃을 따로 만들면 그룹 사이를 오갈 때 페이지 전체가 새로 불러와져 데이터가 초기화된다. */}
        <AuthProvider><AppDataProvider>{children}</AppDataProvider></AuthProvider>
      </body>
    </html>
  );
}
