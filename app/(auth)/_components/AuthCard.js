import AuthDecorations from "./AuthDecorations";
import AuthHeader from "./AuthHeader";

const ALIGN_CLASSES = {
  center: "items-center",
  start: "items-start",
};

// 배경 도형 + 흰 카드(로고, 제목, 설명) + 카드 안 내용. 화면 디자인 전인 화면(회원가입·내 정보)이 쓴다.
// 로그인은 디자인을 적용한 AuthScreen을 쓴다.
// align: 카드를 화면 가운데 또는 위쪽(입력이 긴 회원가입)에 둔다.
export default function AuthCard({ titleId, title, description, decorationVariant, align = "center", headerSize = "large", showBrand = true, children }) {
  return (
    <main className={`relative isolate flex min-h-[max(720px,100svh)] justify-center overflow-hidden px-4 py-12 ${ALIGN_CLASSES[align]}`}>
      <AuthDecorations variant={decorationVariant} />
      <section
        aria-labelledby={titleId}
        className="relative w-full max-w-[520px] rounded-[28px] bg-white px-6 pt-9 pb-[30px] shadow-[0_20px_60px_rgba(31,36,51,0.08)] sm:px-9"
      >
        <AuthHeader titleId={titleId} title={title} description={description} size={headerSize} showBrand={showBrand} />
        {children}
      </section>
    </main>
  );
}
