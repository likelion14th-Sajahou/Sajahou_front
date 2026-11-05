"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import { MOCK_AI_QUESTIONS } from "@/lib/mock/retrospective";
import RetrospectiveSteps from "./RetrospectiveSteps";

export default function AiQuestionsContent() {
  const question = MOCK_AI_QUESTIONS[0];
  const [answer, setAnswer] = useState(question.exampleAnswer);
  const [notice, setNotice] = useState("");

  return (
    <>
      <RetrospectiveSteps currentStep={2} />
      <div className="mt-7 grid grid-cols-[minmax(0,1fr)_320px] items-start gap-5">
        <Card as="section" size="md" className="min-w-0 rounded-[28px]" aria-labelledby="ai-question-title">
          <div className="flex flex-col gap-4 p-1">
            <div className="flex items-center gap-2">
              <Badge tone="dark">AI 질문</Badge>
              <Badge tone={question.tone} size="sm">{question.category}</Badge>
              <p className="ml-auto text-label text-ink-subtle" aria-label={`총 ${MOCK_AI_QUESTIONS.length}개 중 첫 번째 질문`}>
                1 / {MOCK_AI_QUESTIONS.length}
              </p>
            </div>
            <p className="rounded-xl bg-canvas px-3.5 py-2.5 text-body-sm text-ink-muted">
              내 자료의 <mark className="rounded bg-shape-yellow/60 px-[3px] text-ink">“{question.source}”</mark> 에서 더 물어볼게요
            </p>
            <h2 id="ai-question-title" className="text-[24px] leading-[1.45] tracking-[-0.01em]">
              {question.question}
            </h2>
            <TextField
              label="내 답변"
              multiline
              name="answer"
              value={answer}
              onChange={(event) => { setAnswer(event.target.value); setNotice(""); }}
              className="h-[98px]"
            />
            <div className="flex items-center gap-3">
              <TextLink onClick={() => { setAnswer(question.exampleAnswer); setNotice("예시 답변을 넣었어요."); }}>예시 답변 넣기</TextLink>
              <TextLink onClick={() => setNotice("질문 건너뛰기는 준비 중이에요. 입력한 답변은 그대로 유지돼요.")}>건너뛰기</TextLink>
              <Button className="ml-auto" onClick={() => setNotice("다음 질문은 준비 중이에요. 입력한 답변은 현재 화면에서만 유지돼요.")}>답하고 다음 →</Button>
            </div>
          </div>
          <p role="status" className={notice ? "mt-3 px-1 text-body-sm text-ink-muted" : "sr-only"}>{notice}</p>
        </Card>

        <Card as="aside" size="md" aria-labelledby="ai-question-guide-title">
          <div className="flex items-center justify-between border-b border-ink pb-3">
            <h2 id="ai-question-guide-title" className="text-[18px] tracking-[-0.01em]">AI가 찾은 더 물어볼 곳</h2>
            <ShapeCharacter shape="triangle" color="coral" size={16} face="none" cropped />
          </div>
          <ol className="mt-4 flex flex-col gap-2">
            {MOCK_AI_QUESTIONS.map((item, index) => (
              <li key={item.id} aria-current={index === 0 ? "step" : undefined} className={`flex flex-col items-start gap-1 rounded-xl px-3 py-2.5 ${index === 0 ? "bg-[#fff0e6]" : "bg-canvas"}`}>
                <Badge tone={item.tone} size="sm">{item.category}</Badge>
                <p className="text-[13.5px] leading-[1.6]">“{item.source}”</p>
                <p className="text-label leading-[1.5] text-ink-subtle">{index === 0 ? "지금 질문 중" : "대기"}</p>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-label leading-[1.5] text-ink-subtle">자소서에 쓸 가치가 큰 곳부터 최대 5개만 물어요. 마지막은 느낀 점이에요.</p>
          <div className="mt-1 flex items-center gap-3.5 border-t border-line pt-4">
            <TextLink href="/retrospective?step=materials">← 자료 고치기</TextLink>
            <TextLink onClick={() => setNotice("임시 저장은 준비 중이에요. 화면을 벗어나면 입력한 내용이 사라져요.")}>나중에 이어쓰기</TextLink>
          </div>
        </Card>
      </div>
    </>
  );
}
