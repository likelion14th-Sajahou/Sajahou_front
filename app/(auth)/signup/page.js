import AuthDecorations from "../_components/AuthDecorations";
import SignupForm from "./_components/SignupForm";
import SignupSession from "./_components/SignupSession";

export const metadata = {
  title: "회원가입 | 사자록",
};

export default function SignupPage() {
  return (
    <main className="relative isolate flex min-h-[max(720px,100svh)] items-start justify-center overflow-hidden px-4 py-12">
      <AuthDecorations variant="signup" />
      <section
        aria-labelledby="signup-title"
        className="relative w-full max-w-[520px] rounded-[28px] bg-white px-6 pt-9 pb-[30px] shadow-[0_20px_60px_rgba(31,36,51,0.08)] sm:px-9"
      >
        <p className="text-heading leading-[35.2px] tracking-[-0.66px]">사자록</p>
        <h1 id="signup-title" className="mt-[18px] text-[26px] leading-[41.6px] tracking-[-0.52px] text-balance">
          사자록 시작하기
        </h1>
        <p className="mt-1 text-label leading-[19.5px] text-ink-subtle">
          한 번만 입력하면 회고 질문과 역량 태그가 내 파트에 맞춰져요.
        </p>
        <SignupSession><SignupForm /></SignupSession>
      </section>
    </main>
  );
}
