"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";
import AiPromptHeader from "./AiPromptHeader";
import RecordAttachmentsField from "./RecordAttachmentsField";

export default function PortfolioArtifactRequest({
  category,
  progress,
  question,
  exampleAttachments,
  initialAttachments = [],
  onSubmit,
  onSkip,
}) {
  const [attachments, setAttachments] = useState(initialAttachments);

  return (
    <div className="flex flex-col gap-4">
      <AiPromptHeader label="AI 요청" category={category} progress={progress} />
      <h3 className="text-title leading-[29px] tracking-[-0.2px] text-ink">{question}</h3>
      <div className="pt-4">
        <RecordAttachmentsField
          attachments={attachments}
          linkPlaceholder="시연·피그마·GitHub 링크"
          onChange={setAttachments}
        />
      </div>
      <div className="flex items-center gap-3">
        <TextLink onClick={() => setAttachments(exampleAttachments)}>예시 산출물 넣기</TextLink>
        <TextLink onClick={onSkip}>아직 없어요</TextLink>
        <Button
          className="ml-auto"
          disabled={attachments.length === 0}
          onClick={() => onSubmit(attachments)}
        >
          첨부하고 다음 →
        </Button>
      </div>
    </div>
  );
}
