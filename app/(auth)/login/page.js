import AuthDecorations from "../_components/AuthDecorations";
import LoginActions from "./_components/LoginActions";

export const metadata = {
  title: "로그인 | 사자록",
};

export default function LoginPage() {
  return (
    <main className="relative isolate flex min-h-[max(720px,100svh)] items-center justify-center overflow-hidden px-4 py-12">
      <AuthDecorations />
      <section
        aria-labelledby="login-title"
        className="relative w-full max-w-[520px] rounded-[28px] bg-white px-6 pt-9 pb-[30px] shadow-[0_20px_60px_rgba(31,36,51,0.08)] sm:px-9"
      >
        <p className="text-heading leading-[35.2px] tracking-[-0.66px]">
          사자록
        </p>
        <h1
          id="login-title"
          className="mt-[18px] text-[26px] leading-[41.6px] tracking-[-0.52px] text-balance"
        >
          반가워요, 아기사자
        </h1>
        <p className="mt-1 text-label leading-[19.5px] text-ink-subtle">
          멋쟁이사자처럼 중앙대 아기사자의 기록장
        </p>
        <LoginActions />
      </section>
    </main>
  );
}
