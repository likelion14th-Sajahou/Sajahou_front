"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import { MOCK_RECORD_EXAMPLE } from "@/lib/mock/projects";
import RecordAttachmentsField from "./RecordAttachmentsField";
import RecordFormTitle from "./RecordFormTitle";

export default function ProjectRecordAddForm({ onCancel }) {
  const [attachments, setAttachments] = useState([]);
  const [memo, setMemo] = useState("");
  const [notice, setNotice] = useState("");

  function fillExample() {
    setAttachments(MOCK_RECORD_EXAMPLE.attachments);
    setMemo(MOCK_RECORD_EXAMPLE.memo);
    setNotice("");
  }

  function startAiSummary() {
    // 첨부와 메모가 모두 비어 있으면 AI 정리로 넘어가지 않는다(H-12).
    if (attachments.length === 0 && !memo.trim()) {
      setNotice("자료를 첨부하거나 메모를 적어 주세요.");
    }
  }

  return (
    <Card as="section" size="md" aria-labelledby="record-add-title">
      <div className="flex flex-col items-start gap-4">
        <div className="w-full">
          <RecordFormTitle id="record-add-title">기록 추가</RecordFormTitle>
        </div>
        <div className="w-full">
          <RecordAttachmentsField
            attachments={attachments}
            onChange={(next) => {
              setAttachments(next);
              setNotice("");
            }}
          />
        </div>
        <TextField
          label={
            <>
              짧은 메모 <span className="text-ink-subtle">· 대충 써도 돼요</span>
            </>
          }
          multiline
          rows={2}
          placeholder="예) 11/3 기획 회의. 홈 화면 구성 논의. 나는 시안 2개 준비"
          value={memo}
          onChange={(event) => {
            setMemo(event.target.value);
            setNotice("");
          }}
        />
        <TextLink>5칸 직접 채우기</TextLink>
        {notice && <p role="alert" className="text-label text-tint-red-ink">{notice}</p>}
        <div className="w-full pt-1">
          <div className="flex items-center gap-3.5 border-t border-line pt-4">
            <TextLink onClick={onCancel}>취소</TextLink>
            <TextLink onClick={fillExample}>예시 자료 넣기</TextLink>
            <Button className="ml-auto" onClick={startAiSummary}>AI와 정리하기 →</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
