import { Suspense } from "react";
import ProjectContent from "@/components/project/ProjectContent";
import RequireAuth from "@/components/layout/RequireAuth";

export const metadata = {
  title: "프로젝트 | 사자록",
};

export default function ProjectPage({ params, searchParams }) {
  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 pt-6 pb-20">
      <RequireAuth>
        <Suspense
          fallback={
            <p role="status" className="text-body-sm text-ink-muted">
              프로젝트를 불러오는 중이에요.
            </p>
          }
        >
          <ProjectContent params={params} searchParams={searchParams} />
        </Suspense>
      </RequireAuth>
    </main>
  );
}
