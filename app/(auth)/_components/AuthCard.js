import AuthDecorations from "./AuthDecorations";

const ALIGN_CLASSES = {
  center: "items-center",
  start: "items-start",
};

// 로그인·회원가입이 함께 쓰는 화면 틀이다: 배경 도형 + 흰 카드(사자록 로고, 제목, 설명) + 카드 안 내용.
// align: 카드를 화면 가운데(로그인) 또는 위쪽(입력이 긴 회원가입)에 둔다.
export default function AuthCard({ titleId, title, description, decorationVariant, align = "center", showBrand = true, children }) {
  return (
    <main className={`relative isolate flex min-h-[max(720px,100svh)] justify-center overflow-hidden px-4 py-12 ${ALIGN_CLASSES[align]}`}>
      <AuthDecorations variant={decorationVariant} />
      <section
        aria-labelledby={titleId}
        className="relative w-full max-w-[520px] rounded-[28px] bg-white px-6 pt-9 pb-[30px] shadow-[0_20px_60px_rgba(31,36,51,0.08)] sm:px-9"
      >
        {showBrand && <p className="text-heading leading-[35.2px] tracking-[-0.66px]">사자록</p>}
        <h1 id={titleId} className={`${showBrand ? "mt-[18px] " : ""}text-[26px] leading-[41.6px] tracking-[-0.52px] text-balance`}>
          {title}
        </h1>
        <p className="mt-1 text-label leading-[19.5px] text-ink-subtle">{description}</p>
        {children}
      </section>
    </main>
  );
}
