import AuthCard from "../_components/AuthCard";
import SignupForm from "./_components/SignupForm";
import SignupSession from "./_components/SignupSession";

export const metadata = {
  title: "회원가입 | 사자록",
};

export default function SignupPage() {
  return (
    <AuthCard
      titleId="signup-title"
      title="사자록 시작하기"
      description="한 번만 입력하면 회고 질문과 역량 태그가 내 파트에 맞춰져요."
      decorationVariant="signup"
      align="start"
      headerSize="small"
    >
      <SignupSession><SignupForm /></SignupSession>
    </AuthCard>
  );
}
