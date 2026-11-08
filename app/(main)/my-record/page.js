import { Suspense } from "react";
import MyRecordContent from "@/components/my-record/MyRecordContent";
import { MOCK_MY_RECORD } from "@/lib/mock/myRecord";
import RequireAuth from "@/components/layout/RequireAuth";

export const metadata = {
  title: "나의 사자록 | 사자록",
};

export default function MyRecordPage({ searchParams }) {
  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 pt-6 pb-20">
      <h1 className="text-[38px] leading-[1.2] tracking-[-0.76px] text-ink">
        나의 사자록<span className="text-accent">.</span>
      </h1>
      <RequireAuth>
        <Suspense
          fallback={
            <p role="status" className="mt-6 text-body-sm text-ink-muted">
              나의 사자록을 불러오는 중이에요.
            </p>
          }
        >
          <MyRecordContent
            searchParams={searchParams}
            record={MOCK_MY_RECORD}
          />
        </Suspense>
      </RequireAuth>
    </main>
  );
}
