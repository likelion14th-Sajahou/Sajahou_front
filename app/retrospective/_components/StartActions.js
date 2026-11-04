"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";

export default function StartActions({ status = "idle" }) {
  const [notice, setNotice] = useState("");
  const isWriting = status === "writing";

  return (
    <div className="mt-5 border-t border-line pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3.5">
        <TextLink onClick={() => setNotice("휴회 상태 화면은 다음 작업에서 연결할 예정입니다.")}>
          이번 주는 휴회했어요
        </TextLink>
        {isWriting ? (
          <div className="grid w-full grid-cols-2 gap-2 sm:ml-auto sm:flex sm:w-auto">
            <Button variant="secondary" href="/retrospective" className="min-w-0 max-sm:px-3">
              처음부터
            </Button>
            <Button
              variant="accent"
              className="min-w-0 max-sm:px-3"
              onClick={() => setNotice("이어 쓸 자료 입력 화면은 준비 중입니다. 03 화면 구현 후 연결할 예정입니다.")}
            >
              이어 쓰기 →
            </Button>
          </div>
        ) : (
          <Button onClick={() => setNotice("자료 입력 화면은 준비 중입니다. 03 화면 구현 후 연결할 예정입니다.")}>
            시작하기 →
          </Button>
        )}
      </div>
      <p role="status" className={notice ? "mt-3 text-body-sm text-ink-muted" : "sr-only"}>
        {notice}
      </p>
    </div>
  );
}
