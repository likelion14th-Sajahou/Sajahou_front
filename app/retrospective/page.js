import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import RetrospectiveSteps from "./_components/RetrospectiveSteps";
import StartActions from "./_components/StartActions";

export const metadata = {
  title: "이번 주 회고 | 사자록",
};

async function StartActionsPreview({ searchParams }) {
  const { preview } = await searchParams;
  const status = preview === "writing" ? "writing" : "idle";

  return <StartActions key={status} status={status} />;
}

export default function RetrospectivePage({ searchParams }) {
  return (
    <>
      <Header userName="김사자" userPart="기획·디자인" />
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

        <RetrospectiveSteps />

        <div className="mt-7 grid grid-cols-1 items-start gap-5 min-[901px]:grid-cols-[minmax(0,1fr)_320px]">
          <Card as="section" size="md" aria-labelledby="start-title">
            <h2 id="start-title" className="text-heading tracking-[-0.02em]">
              이번 주 세션 회고를 시작해요
            </h2>
            <div className="mt-4 flex items-end gap-3.5 pt-1.5 pb-1 sm:min-h-[120px]">
              <div className="relative size-16 shrink-0" aria-hidden="true">
                <Image
                  src="/images/retrospective/30a4f.svg"
                  alt=""
                  width={56.32}
                  height={52.48}
                  className="absolute top-[8%] left-[6%]"
                />
              </div>
              <div className="mb-[18px] w-[224px] min-w-0 rounded-[22px] rounded-bl-[6px] border-2 border-ink bg-shape-yellow px-4 py-3 text-[16px] leading-[1.45] tracking-[-0.01em] shadow-[3px_3px_0_var(--color-ink)] sm:w-auto sm:px-[22px] sm:py-4 sm:text-[19px]">
                <p>지금은 조금 귀찮아도,</p>
                <p>쌓이면 나만의 큰 자산이 돼요!</p>
              </div>
            </div>
            <Suspense
              fallback={
                <p role="status" className="mt-5 border-t border-line pt-4 text-body-sm text-ink-muted">
                  회고 상태를 불러오는 중이에요.
                </p>
              }
            >
              <StartActionsPreview searchParams={searchParams} />
            </Suspense>
          </Card>

          <Card as="aside" size="md" aria-labelledby="deadline-title">
            <div className="flex items-center justify-between border-b border-ink pb-3">
              <h2 id="deadline-title" className="text-[18px] tracking-[-0.01em]">
                마감일
              </h2>
              <Image src="/images/retrospective/d3b6d.svg" alt="" width={14.72} height={14.72} />
            </div>
            <dl className="mt-4 flex flex-col gap-2 text-body-sm">
              <div className="flex justify-between gap-4">
                <dt>세션 회고</dt>
                <dd>11/1(일) 23:59</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>과제 회고</dt>
                <dd>11/3(화) 23:59</dd>
              </div>
            </dl>
          </Card>
        </div>
      </main>
    </>
  );
}
