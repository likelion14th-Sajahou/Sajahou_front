import RequireAuth from "@/components/layout/RequireAuth";
import ProfileContent from "@/components/profile/ProfileContent";

export const metadata = {
  title: "내 정보 | 사자록",
};

export default function ProfilePage() {
  return (
    <main className="mx-auto w-full max-w-[760px] px-4 pt-6 pb-20">
      <h1 className="text-[38px] leading-[1.2] tracking-[-0.76px] text-ink">
        내 정보<span className="text-accent">.</span>
      </h1>
      <RequireAuth>
        <ProfileContent />
      </RequireAuth>
    </main>
  );
}
