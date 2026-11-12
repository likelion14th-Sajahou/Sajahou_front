import AuthHeader from "../_components/AuthHeader";
import AuthScreen from "../_components/AuthScreen";
import SignupForm from "./_components/SignupForm";
import SignupSession from "./_components/SignupSession";

export const metadata = {
  title: "회원가입 | 사자록",
};

// 회원가입(S-02~S-05, Figma '[디] 00-a 시작 · 회원가입'): 틀 카드 안 흰 패널에 로고·제목, 계정, 기본 정보, 파트, 동의, 가입 버튼.
// 입력이 길어 카드를 화면 위쪽에 둔다.
export default function SignupPage() {
  return (
    <AuthScreen align="start" frameClassName="max-w-[456px]">
      <section aria-labelledby="signup-title" className="flex flex-col items-center rounded-[22px] bg-white px-6 pt-12 pb-8 sm:px-12">
        <AuthHeader titleId="signup-title" title="사자록 시작하기" description="한 번만 입력하면 회고 질문과 역량 태그가 내 파트에 맞춰져요." size="small" />
        <div className="w-full">
          <SignupSession><SignupForm /></SignupSession>
        </div>
      </section>
    </AuthScreen>
  );
}
