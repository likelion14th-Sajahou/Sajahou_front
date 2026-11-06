"use client";

import { useState } from "react";
import { MOCK_RECORD_QUESTIONS } from "@/lib/mock/projects";
import AiQuestionForm from "./AiQuestionForm";

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
  const question = questions[index];
  const sourceLabel = getSourceLabel(attachments);

  function goNext(nextAnswers) {
    if (index === questions.length - 1) {
      onComplete(nextAnswers);
      return;
    }

    setAnswers(nextAnswers);
    setIndex(index + 1);
  }

  return (
    <AiQuestionForm
      key={question.fieldKey}
      category={<span className="px-[9px] py-0.5 text-badge text-ink">{question.category}</span>}
      progress={`${index + 1} / ${questions.length}`}
      source={
        <>
          {sourceLabel ? "첨부한 " : "적어 준 "}
          <mark className="rounded bg-shape-yellow/60 px-[3px] text-ink">{sourceLabel || "메모"}</mark>
          {" 을(를) 읽고 물어볼게요"}
        </>
      }
      question={question.question}
      placeholder="한두 문장이면 충분해요"
      exampleAnswer={question.exampleAnswer}
      onAnswer={(answer) => goNext({ ...answers, [question.fieldKey]: answer })}
      onSkip={() => goNext(answers)}
    />
  );
}
