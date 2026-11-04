"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";

export default function StartActions() {
  const [notice, setNotice] = useState("");

  return (
    <div className="mt-5 border-t border-line pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3.5">
        <TextLink onClick={() => setNotice("휴회 상태 화면은 다음 작업에서 연결할 예정입니다.")}>
          이번 주는 휴회했어요
        </TextLink>
        <Button onClick={() => setNotice("자료 입력 화면은 준비 중입니다. 03 화면 구현 후 연결할 예정입니다.")}>
          시작하기 →
        </Button>
      </div>
      <p role="status" className={notice ? "mt-3 text-body-sm text-ink-muted" : "sr-only"}>
        {notice}
      </p>
    </div>
  );
}
