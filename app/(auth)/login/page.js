import Image from "next/image";
import AuthHeader from "../_components/AuthHeader";
import AuthScreen from "../_components/AuthScreen";
import LoginActions from "./_components/LoginActions";

export const metadata = {
  title: "로그인 | 사자록",
};

// 로그인(S-01, Figma '[디] 00 시작 · 로그인'): 틀 카드 왼쪽에 캐릭터, 오른쪽 흰 패널에 로고·제목과 로그인 버튼.
// 좁은 화면에서는 캐릭터와 로그인 패널을 세로로 쌓는다.
export default function LoginPage() {
  return (
    <AuthScreen frameClassName="flex max-w-[456px] flex-col lg:h-[600px] lg:max-w-[1040px] lg:flex-row">
      <div aria-hidden="true" className="flex items-center justify-center px-5 py-6 lg:flex-1 lg:p-0">
        <Image src="/images/characters/cloud-shooting-star.png" alt="" width={454} height={340} sizes="(min-width: 1024px) 454px, (min-width: 456px) 300px, calc(100vw - 88px)" className="h-auto w-full max-w-[300px] lg:max-w-[454px]" priority />
      </div>
      <section aria-labelledby="login-title" className="flex w-full flex-col items-center justify-center rounded-[20px] bg-white px-6 py-9 sm:p-12 lg:w-[440px] lg:shrink-0">
        <div className="flex w-full max-w-[344px] flex-col items-center gap-8">
          <AuthHeader titleId="login-title" title="반가워요, 아기사자!" description="멋쟁이사자처럼 중앙대 아기사자의 기록장" />
          <LoginActions />
        </div>
      </section>
    </AuthScreen>
  );
}
