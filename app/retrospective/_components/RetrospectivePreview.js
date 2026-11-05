"use client";

import { createContext, useContext, useState } from "react";
import Link from "next/link";
import Chip from "@/components/ui/Chip";

const RetrospectivePreviewContext = createContext(null);
const PARTS = ["기획·디자인", "프론트엔드", "백엔드"];

// 데모 파트와 과제 선택을 제목 영역과 자료 폼에서 함께 사용한다.
// 로그인한 사용자의 실제 파트나 서버 데이터는 변경하지 않는다.
export default function RetrospectivePreview({ initialPart, children }) {
  const [part, setPart] = useState(initialPart);
  const [assignmentStatus, setAssignmentStatus] = useState("record");

  return (
    <RetrospectivePreviewContext value={{ part, setPart, assignmentStatus, setAssignmentStatus }}>
      {children}
    </RetrospectivePreviewContext>
  );
}

export function useRetrospectivePreview() {
  return useContext(RetrospectivePreviewContext);
}

export function RetrospectiveHeading({ week }) {
  const { part, setPart, assignmentStatus } = useRetrospectivePreview();

  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3.5">
      <div className="flex flex-col items-start gap-1.5">
        <Link href="/" className="text-body-sm text-ink-muted">← 홈</Link>
        <p className="text-label text-accent-strong">{part}</p>
        <h1 className="text-[38px] leading-[1.2] tracking-[-0.02em]">
          {week}주차 세션 회고
        </h1>
        {assignmentStatus === "later" && (
          <div aria-label="회고 작성 상태" className="flex gap-1.5 pt-2">
            <Chip selected disabled className="disabled:cursor-default">세션 회고 · 작성 중</Chip>
            <Chip disabled className="disabled:cursor-default">과제 회고 · 시작 전</Chip>
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <p className="text-label text-ink-subtle">데모 · 파트 바꿔 보기</p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="파트 미리보기">
          {PARTS.map((item) => (
            <Chip key={item} selected={item === part} onClick={() => setPart(item)}>{item}</Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
