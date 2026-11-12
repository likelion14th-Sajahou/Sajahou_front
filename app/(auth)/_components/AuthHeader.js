import Image from "next/image";

// 카드 위쪽 로고 크기(Figma 'Auth Header'): large는 로그인, small은 회원가입.
const LOGO_SIZES = {
  large: { width: 164, height: 59 },
  small: { width: 117, height: 42 },
};

// 로그인·회원가입·내 정보 카드 위쪽의 로고 + 제목 + 설명(Figma 'Auth Header').
// 로고가 없는 화면(내 정보)은 showBrand={false}.
export default function AuthHeader({ titleId, title, description, size = "large", showBrand = true }) {
  const logo = LOGO_SIZES[size];

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      {showBrand && <Image src="/images/brand/logo.png" alt="사자록" width={logo.width} height={logo.height} priority />}
      <div className="flex flex-col items-center gap-1.5">
        <h1 id={titleId} className="font-display text-[26px] leading-9 text-balance">
          {title}
        </h1>
        <p className={`text-label leading-5 text-ink-subtle ${size === "large" ? "font-display" : ""}`}>{description}</p>
      </div>
    </div>
  );
}
