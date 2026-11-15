import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import MatchingContent from "./_components/MatchingContent";
import StoryCardCount from "./_components/StoryCardCount";
import RequireAuth from "@/components/layout/RequireAuth";

export const metadata = { title: "자소서 매칭 | 사자록" };

export default function MatchingPage({ searchParams }) {
  return (
    <main className="matching-page mx-auto w-full max-w-[1120px] px-4 pt-10 pb-20 font-display tracking-[-0.15px]">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-1.5">
          <Link href="/my-record" className="w-fit text-body-sm text-ink-muted">← 나의 사자록</Link>
          <p className="text-label text-accent-strong">공고에 맞는 내 경험 찾기</p>
          <h1 className="text-[32px] leading-[46px] tracking-[-0.64px]">자소서 매칭</h1>
        </div>
        <div className="flex shrink-0 items-center gap-3.5 rounded-[24px] bg-shape-yellow p-3.5 pr-[22px]">
          <Image src="/images/home/matching-eyes.png" alt="" width={104} height={58} className="h-auto w-[104px]" />
          <div>
            <p className="text-label text-ink">내 스토리 카드</p>
            <StoryCardCount />
          </div>
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
