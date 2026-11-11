import { Suspense } from "react";
import Link from "next/link";
import MatchingContent from "./_components/MatchingContent";
import StoryCardCount from "./_components/StoryCardCount";
import RequireAuth from "@/components/layout/RequireAuth";

export const metadata = { title: "자소서 매칭 | 사자록" };

export default function MatchingPage({ searchParams }) {
  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 pt-6 pb-20">
      <div className="flex items-end gap-6">
        <div className="flex flex-1 flex-col gap-1.5">
          <Link href="/my-record" className="w-fit text-body-sm text-ink-muted">← 나의 사자록</Link>
          <p className="text-label text-accent-strong">자소서 매칭</p>
          <h1 className="text-[38px] leading-[1.2] tracking-[-0.76px]">공고에 맞는 내 경험 찾기</h1>
        </div>
        <div>
          <p className="text-caption text-ink-subtle">내 스토리 카드</p>
          <StoryCardCount />
        </div>
      </div>
      <RequireAuth>
        {/* 주소의 공고 id는 요청마다 달라서 Suspense 안에서 읽는다. */}
        <Suspense fallback={<p role="status" className="mt-6 text-body-sm text-ink-muted">자소서 매칭을 불러오는 중이에요.</p>}>
          <MatchingContent searchParams={searchParams} />
        </Suspense>
      </RequireAuth>
    </main>
  );
}
