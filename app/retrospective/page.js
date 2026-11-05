import { Suspense } from "react";
import { MOCK_RETROSPECTIVE } from "@/lib/mock/retrospective";
import { MOCK_USER } from "@/lib/mock/user";
import RetrospectiveContent from "./_components/RetrospectiveContent";
import RetrospectivePreview, { RetrospectiveHeading } from "./_components/RetrospectivePreview";

export const metadata = {
  title: "이번 주 회고 | 사자록",
};

export default function RetrospectivePage({ searchParams }) {
  return (
    <RetrospectivePreview initialPart={MOCK_USER.part}>
      <main className="mx-auto w-full max-w-[1120px] px-4 pt-6 pb-20">
        <Suspense
          fallback={
            <p role="status" className="mt-6 text-body-sm text-ink-muted">
              회고 상태를 불러오는 중이에요.
            </p>
          }
        >
          <RetrospectiveHeading week={MOCK_RETROSPECTIVE.week} />
          <RetrospectiveContent
            searchParams={searchParams}
            retrospective={MOCK_RETROSPECTIVE}
          />
        </Suspense>
      </main>
    </RetrospectivePreview>
  );
}
