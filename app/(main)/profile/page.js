import RequireAuth from "@/components/layout/RequireAuth";
import ProfileContent from "@/components/profile/ProfileContent";
import AuthHeader from "@/app/(auth)/_components/AuthHeader";
import AuthScreen from "@/app/(auth)/_components/AuthScreen";

export const metadata = {
  title: "내 정보 | 사자록",
};

// 내 정보(S-06): 회원가입과 같은 입력칸을 쓰므로 화면도 회원가입 디자인을 따른다.
// 진한 배경 + 회색 틀 안의 흰 패널. 상단 메뉴가 있어 메뉴 높이를 뺀 만큼 채우고, 로고는 메뉴에 있으니 뺀다.
export default function ProfilePage() {
  return (
    <AuthScreen align="start" frameClassName="max-w-[456px]" minHeightClassName="min-h-[calc(100svh-var(--header-height))]">
      <section aria-labelledby="profile-title" className="flex flex-col items-center rounded-[22px] bg-white px-6 pt-12 pb-8 sm:px-12">
        <AuthHeader titleId="profile-title" title="내 정보" description="회원 정보를 확인하고 수정할 수 있어요." size="small" showBrand={false} />
        <div className="w-full">
          <RequireAuth>
            <ProfileContent />
          </RequireAuth>
        </div>
      </section>
    </AuthScreen>
  );
}
