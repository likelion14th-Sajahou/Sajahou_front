import AuthCard from "../_components/AuthCard";
import LoginActions from "./_components/LoginActions";

export const metadata = {
  title: "로그인 | 사자록",
};

export default function LoginPage() {
  return (
    <AuthCard titleId="login-title" title="반가워요, 아기사자" description="멋쟁이사자처럼 중앙대 아기사자의 기록장">
      <LoginActions />
    </AuthCard>
  );
}
