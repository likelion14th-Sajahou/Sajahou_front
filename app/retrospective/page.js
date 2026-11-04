import Link from "next/link";
import { Suspense } from "react";
import Chip from "@/components/ui/Chip";
import RetrospectiveContent from "./_components/RetrospectiveContent";

export const metadata = {
  title: "이번 주 회고 | 사자록",
};

export default function RetrospectivePage({ searchParams }) {
  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 pt-6 pb-20">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3.5">
        <div className="flex flex-col items-start gap-1.5">
          <Link href="/" className="text-body-sm text-ink-muted">
            ← 홈
          </Link>
          <p className="text-label text-accent-strong">기획·디자인</p>
          <h1 className="text-[38px] leading-[1.2] tracking-[-0.02em]">
            35주차 세션 회고
          </h1>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <p className="text-label text-ink-subtle">데모 · 파트 바꿔 보기</p>
          <div className="flex flex-wrap gap-1.5" aria-label="파트 미리보기">
            {["기획·디자인", "프론트엔드", "백엔드"].map((part, index) => (
              <Chip
                key={part}
                selected={index === 0}
                disabled
                title="파트 전환은 추후 연결 예정입니다."
                className="disabled:cursor-default"
              >
                {part}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <Suspense
        fallback={
          <p role="status" className="mt-6 text-body-sm text-ink-muted">
            회고 상태를 불러오는 중이에요.
          </p>
        }
      >
        <RetrospectiveContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
