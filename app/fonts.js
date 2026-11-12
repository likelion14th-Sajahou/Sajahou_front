import localFont from "next/font/local";
import { Noto_Sans_KR } from "next/font/google";

// 디자인 시스템 폰트(Figma 'Design' 섹션). 파일 출처와 라이선스는 app/fonts/LICENSE.md에 있다.
// 폰트 파일은 받은 그대로 쓴다(NPS 폰트는 변형 금지).

// 본문: NPS 폰트(국민연금체). 메뉴·본문·칩 등 대부분의 글자.
// 배포된 OTF는 Chrome 웹폰트 검사(OTS: CFF Name INDEX 오류)를 통과하지 못해 TTF를 쓴다.
// 디자인에 쓰인 Regular·Bold만 둔다. ExtraBold(TTF)도 배포되니 디자인에 쓰이면 여기에 추가한다.
export const npsFont = localFont({
  src: [
    { path: "./fonts/NPSfont_regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/NPSfont_bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-nps",
  display: "swap",
});

// 제목·Primary 버튼: 산돌 삼립호빵체 Basic
export const displayFont = localFont({
  src: "./fonts/SDSamliphopangcheBasic.otf",
  variable: "--font-samliphopang",
  display: "swap",
});

// Secondary 버튼('데모 계정으로 둘러보기')에만 쓰인다. 첫 화면에 꼭 필요하지 않아 미리 불러오지 않는다.
export const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  weight: "500",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
