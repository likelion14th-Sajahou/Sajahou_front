import Image from "next/image";
import AuthDecorations from "./AuthDecorations";

const ALIGN_CLASSES = {
  center: "items-center",
  start: "items-start",
};

// 카드 위쪽 로고 크기(Figma 'Auth Header'): large는 로그인, small은 회원가입.
const LOGO_SIZES = {
  large: { width: 164, height: 59 },
  small: { width: 117, height: 42 },
};

// 로그인·회원가입이 함께 쓰는 화면 틀이다: 배경 도형 + 흰 카드(로고, 제목, 설명) + 카드 안 내용.
// 위쪽 로고·제목·설명은 디자인 시스템의 'Auth Header'다. 내 정보처럼 로고가 없는 화면은 showBrand={false}.
// align: 카드를 화면 가운데(로그인) 또는 위쪽(입력이 긴 회원가입)에 둔다.
export default function AuthCard({ titleId, title, description, decorationVariant, align = "center", headerSize = "large", showBrand = true, children }) {
  const logo = LOGO_SIZES[headerSize];

  return (
    <main className={`relative isolate flex min-h-[max(720px,100svh)] justify-center overflow-hidden px-4 py-12 ${ALIGN_CLASSES[align]}`}>
      <AuthDecorations variant={decorationVariant} />
      <section
        aria-labelledby={titleId}
        className="relative w-full max-w-[520px] rounded-[28px] bg-white px-6 pt-9 pb-[30px] shadow-[0_20px_60px_rgba(31,36,51,0.08)] sm:px-9"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          {showBrand && <Image src="/images/brand/logo.png" alt="사자록" width={logo.width} height={logo.height} priority />}
          <div className="flex flex-col items-center gap-1.5">
            <h1 id={titleId} className="font-display text-[26px] leading-9 text-balance">
              {title}
            </h1>
            <p className="text-label leading-5 text-ink-subtle">{description}</p>
          </div>
        </div>
        {children}
      </section>
    </main>
  );
}
