import { Suspense } from "react";
import MyRecordContent from "@/components/my-record/MyRecordContent";
import RequireAuth from "@/components/layout/RequireAuth";

export const metadata = {
  title: "나의 사자록 | 사자록",
};

export default function MyRecordPage() {
  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 pt-10 pb-20">
      <h1 className="font-display text-[32px] leading-[46px] tracking-[-0.64px] text-ink">
        나의 사자록
      </h1>
      <RequireAuth>
        <Suspense
          fallback={
            <p role="status" className="mt-6 text-body-sm text-ink-muted">
              나의 사자록을 불러오는 중이에요.
            </p>
          }
        >
          <MyRecordContent />
        </Suspense>
      </RequireAuth>
    </main>
  );
}
