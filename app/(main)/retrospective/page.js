import { Suspense } from "react";
import RetrospectiveContent from "./_components/RetrospectiveContent";
import RetrospectivePreview, { RetrospectiveHeading } from "./_components/RetrospectivePreview";
import RequireAuth from "@/components/layout/RequireAuth";

export const metadata = {
  title: "이번 주 회고 | 사자록",
};

export default function RetrospectivePage({ searchParams }) {
  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 pt-6 pb-20">
      <RequireAuth>
        <RetrospectivePreview>
          <Suspense
            fallback={
              <p role="status" className="mt-6 text-body-sm text-ink-muted">
                회고 상태를 불러오는 중이에요.
              </p>
            }
          >
            <RetrospectiveHeading />
            <RetrospectiveContent searchParams={searchParams} />
          </Suspense>
        </RetrospectivePreview>
      </RequireAuth>
    </main>
  );
}
