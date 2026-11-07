"use client";

import { useMockData } from "@/components/layout/MockDataProvider";
import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";

export default function StartActions({ isWritingPreview = false, isAssignment = false }) {
  const { weekStatus, setWeekStatus } = useMockData();
  const isWriting = isWritingPreview || weekStatus === "writing";

  return (
    <div className="mt-5 border-t border-line pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3.5">
        {!isAssignment && (
          <TextLink href="/retrospective" onClick={() => setWeekStatus("paused")}>
            이번 주는 휴회했어요
          </TextLink>
        )}
        {isAssignment ? (
          <Button className="ml-auto" href="/retrospective?step=materials&type=assignment">시작하기 →</Button>
        ) : isWriting ? (
          <div className="grid w-full grid-cols-2 gap-2 sm:ml-auto sm:flex sm:w-auto">
            <Button
              variant="secondary"
              href="/retrospective"
              className="min-w-0 max-sm:px-3"
              onClick={() => setWeekStatus("idle")}
            >
              처음부터
            </Button>
            <Button
              variant="accent"
              className="min-w-0 max-sm:px-3"
              href="/retrospective?step=materials"
              onClick={() => setWeekStatus("writing")}
            >
              이어 쓰기 →
            </Button>
          </div>
        ) : (
          <Button href="/retrospective?step=materials" onClick={() => setWeekStatus("writing")}>
            시작하기 →
          </Button>
        )}
      </div>
    </div>
  );
}
