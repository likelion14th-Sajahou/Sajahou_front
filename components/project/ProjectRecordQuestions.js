"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import { MOCK_RECORD_QUESTIONS } from "@/lib/mock/projects";

const MAX_QUESTIONS = 4;

// 첨부 종류에 맞는 질문만 고른다(H-13). 실제로는 AI가 자료를 읽고 만든다.
function selectQuestions(attachments) {
  const kinds = attachments.map(({ kind }) => kind);

  return MOCK_RECORD_QUESTIONS.filter(
    ({ attachmentKinds }) =>
      !attachmentKinds || attachmentKinds.some((kind) => kinds.includes(kind)),
  ).slice(0, MAX_QUESTIONS);
}

function getSourceLabel(attachments) {
  const fileNames = attachments.filter(({ kind }) => kind !== "link").map(({ name }) => name);
  const linkCount = attachments.length - fileNames.length;

  return [...fileNames, ...(linkCount > 0 ? [`링크 ${linkCount}개`] : [])].join(", ");
}

export default function ProjectRecordQuestions({ attachments, onComplete }) {
  const [questions] = useState(() => selectQuestions(attachments));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [answer, setAnswer] = useState("");
  const [notice, setNotice] = useState("");
  const question = questions[index];
  const sourceLabel = getSourceLabel(attachments);

  function goNext(nextAnswers) {
    if (index === questions.length - 1) {
      onComplete(nextAnswers);
      return;
    }

    setAnswers(nextAnswers);
    setIndex(index + 1);
    setAnswer("");
    setNotice("");
  }

  function answerAndContinue() {
    if (!answer.trim()) {
      setNotice("답을 적거나, 모르겠으면 건너뛰어도 돼요");
      return;
    }

    goNext({ ...answers, [question.id]: answer.trim() });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Badge tone="dark">AI 질문</Badge>
        <span className="px-[9px] py-0.5 text-badge text-ink">{question.category}</span>
        <p className="ml-auto text-label text-ink-subtle">
          {index + 1} / {questions.length}
        </p>
      </div>
      <p className="rounded-xl bg-canvas px-3.5 py-2.5 text-body-sm text-ink-muted">
        {sourceLabel ? "첨부한 " : "적어 준 "}
        <mark className="rounded bg-shape-yellow/60 px-[3px] text-ink">{sourceLabel || "메모"}</mark>
        {" 을(를) 읽고 물어볼게요"}
      </p>
      <h3 className="text-title leading-[29px] tracking-[-0.2px] text-ink">{question.question}</h3>
      <TextField
        label="내 답변"
        multiline
        placeholder="한두 문장이면 충분해요"
        value={answer}
        onChange={(event) => {
          setAnswer(event.target.value);
          setNotice("");
        }}
        className="h-[98px]"
      />
      {notice && <p role="alert" className="text-label text-tint-red-ink">{notice}</p>}
      <div className="flex items-center gap-3">
        <TextLink
          onClick={() => {
            setAnswer(question.exampleAnswer);
            setNotice("");
          }}
        >
          예시 답변 넣기
        </TextLink>
        <TextLink onClick={() => goNext(answers)}>건너뛰기</TextLink>
        <Button className="ml-auto" onClick={answerAndContinue}>답하고 다음 →</Button>
      </div>
    </div>
  );
}
