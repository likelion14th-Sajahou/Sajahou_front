import { Gowun_Dodum } from "next/font/google";
import Header from "@/components/layout/Header";
import { MOCK_USER } from "@/lib/mock/user";
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
        <Header userName={MOCK_USER.name} userPart={MOCK_USER.part} />
        {children}
      </body>
    </html>
  );
}
