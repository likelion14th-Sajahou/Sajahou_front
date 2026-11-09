import RequireAuth from "@/components/layout/RequireAuth";
import ProfileContent from "@/components/profile/ProfileContent";
import AuthCard from "@/app/(auth)/_components/AuthCard";

export const metadata = {
  title: "내 정보 | 사자록",
};

export default function ProfilePage() {
  return (
    <AuthCard
      titleId="profile-title"
      title="내 정보"
      description="회원 정보를 확인하고 수정할 수 있어요."
      decorationVariant="signup"
      align="start"
      showBrand={false}
    >
      <RequireAuth>
        <ProfileContent />
      </RequireAuth>
    </AuthCard>
  );
}
