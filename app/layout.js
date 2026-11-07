import { Suspense } from "react";
import { Gowun_Dodum } from "next/font/google";
import Header from "@/components/layout/Header";
import MockDataProvider from "@/components/layout/MockDataProvider";
import ScrollToTopOnNavigate from "@/components/layout/ScrollToTopOnNavigate";
import "./globals.css";

const gowunDodum = Gowun_Dodum({
  variable: "--font-gowun-dodum",
  weight: "400",
  subsets: ["latin"],
});

export const metadata = {
  title: "사자록",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ko"
      className={`${gowunDodum.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <ScrollToTopOnNavigate />
        </Suspense>
        <MockDataProvider>
          <Header />
          {children}
        </MockDataProvider>
      </body>
    </html>
  );
}
