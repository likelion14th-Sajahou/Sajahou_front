import Link from "next/link";
import MatchingForm from "./_components/MatchingForm";
import StoryCardCount from "./_components/StoryCardCount";

export const metadata = { title: "자소서 매칭 | 사자록" };

export default function MatchingPage() {
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
      <MatchingForm />
    </main>
  );
}
