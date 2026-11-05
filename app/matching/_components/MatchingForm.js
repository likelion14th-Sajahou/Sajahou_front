"use client";

import { useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import { MATCHING_SAMPLE } from "@/lib/mock/matching";
import MatchingAttachments from "./MatchingAttachments";
import MatchingResults from "./MatchingResults";
import { createMockMatchingResult } from "@/lib/mock/matchingResult";

const EMPTY_FORM = { company: "", role: "", jd: "", preferences: "", companyInfo: "" };

export default function MatchingForm() {
  const [fields, setFields] = useState(EMPTY_FORM);
  const [questions, setQuestions] = useState([{ id: "initial", text: "" }]);
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([]);
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState(null);
  const resultHeadingRef = useRef(null);
  const formRef = useRef(null);
  const questionRefs = useRef(new Map());

  function updateField(key, value) {
    setFields((previous) => ({ ...previous, [key]: value }));
    setNotice("");
  }

  function loadSample() {
    const { questions: sampleQuestions, ...sampleFields } = MATCHING_SAMPLE;
    setFields({ ...sampleFields });
    setQuestions(sampleQuestions.map((text) => ({ id: crypto.randomUUID(), text })));
    setFiles([{ id: "sample-pdf", name: "모아핀테크_채용공고.pdf", kind: "PDF", sample: true }]);
    setLinks([{ id: "sample-link", url: "https://www.saramin.co.kr/zf_user/jobs/view?rec_idx=482910", unreadable: true }]);
    setNotice("예시 공고와 문항을 넣었어요. 원하는 내용으로 수정할 수 있어요.");
  }

  function submit(event) {
    event.preventDefault();
    if (!questions.some(({ text }) => text.trim())) {
      setNotice("자소서 문항을 하나 이상 넣어 주세요.");
      questionRefs.current.get(questions[0].id)?.focus();
      return;
    }
    if (![fields.jd, fields.preferences, fields.companyInfo].some((text) => text.trim()) && !files.length) {
      setNotice(links.length ? "링크 본문 읽기는 준비 중이에요. 공고 내용을 붙여 넣거나 파일을 선택해 주세요." : "공고 내용을 붙여 넣거나 파일을 선택해 주세요.");
      formRef.current.elements.namedItem("jd")?.focus();
      return;
    }
    setResult({ ...createMockMatchingResult(fields, questions), id: crypto.randomUUID() });
    setNotice("예시 매칭 결과를 표시했어요.");
    requestAnimationFrame(() => {
      const heading = resultHeadingRef.current;
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    });
  }

  function field(key, label, placeholder, rows) {
    return <TextField label={label} name={key} value={fields[key]} placeholder={placeholder} onChange={(event) => updateField(key, event.target.value)} multiline={Boolean(rows)} rows={rows} />;
  }

  return (
    <>
    <Card as="form" size="md" className="mt-6 flex flex-col gap-4" aria-labelledby="matching-form-title" onSubmit={submit} ref={formRef}>
      <div>
        <h2 id="matching-form-title" className="text-title tracking-[-0.4px]">지원할 곳 알려 주기</h2>
        <p className="text-label leading-[1.5] text-ink-subtle">공고와 문항을 넣으면 내 사자록에서 쓸 만한 경험을 골라요.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {field("company", "회사", "예) 모아핀테크")}
        {field("role", "직무·부서", "예) 서비스 기획 인턴")}
      </div>
      <MatchingAttachments files={files} links={links} onFilesChange={setFiles} onLinksChange={setLinks} />
      {field("jd", "주요 업무·자격 요건 (JD)", "공고 본문을 붙여 넣어요", 4)}
      <div className="grid grid-cols-2 gap-4">
        {field("preferences", <>채용 부서 우대사항 <span className="text-ink-subtle">· 선택</span></>, "예) 데이터로 디자인 결정을 설명할 수 있는 분", 3)}
        {field("companyInfo", <>기업 정보·인재상 <span className="text-ink-subtle">· 선택</span></>, "예) 사용자 곁에서 생각하는 사람", 3)}
      </div>
      <fieldset className="flex min-w-0 flex-col gap-1.5">
        <legend className="mb-1.5 text-label text-ink-muted">자소서 문항</legend>
        <div className="flex flex-col gap-2">
          {questions.map((question, index) => (
            <div key={question.id} className="flex items-start gap-2">
              <span aria-hidden="true" className="mt-3 rounded-full bg-canvas px-2.5 py-[3px] text-caption text-ink-muted">{index + 1}</span>
              <TextField multiline rows={2} name={`question-${question.id}`} aria-label={`문항 ${index + 1}`} placeholder="예) 협업 과정에서 의견을 조율한 경험" value={question.text} ref={(element) => { if (element) questionRefs.current.set(question.id, element); else questionRefs.current.delete(question.id); }} onChange={(event) => { setQuestions((previous) => previous.map((item) => item.id === question.id ? { ...item, text: event.target.value } : item)); setNotice(""); }} />
              {questions.length > 1 && <TextLink size="sm" aria-label={`문항 ${index + 1} 빼기`} onClick={() => { const next = questions.filter(({ id }) => id !== question.id); setQuestions(next); questionRefs.current.get(next[Math.min(index, next.length - 1)].id)?.focus(); }}>빼기</TextLink>}
            </div>
          ))}
          <TextLink className="self-start" onClick={() => {
            const id = crypto.randomUUID();
            setQuestions((previous) => [...previous, { id, text: "" }]);
            requestAnimationFrame(() => questionRefs.current.get(id)?.focus());
          }}>+ 문항 추가</TextLink>
        </div>
      </fieldset>
      <div className="pt-1">
        <div className="flex items-center justify-between gap-3.5 border-t border-line pt-4">
          <TextLink onClick={loadSample}>예시 공고 넣기</TextLink>
          <Button type="submit" variant="accent">내 사자록에서 찾기 →</Button>
        </div>
      </div>
      <p role="status" className="sr-only">{notice}</p>
      <p className="rounded-xl bg-tint-yellow px-3.5 py-2.5 text-label text-ink-muted">사자록에 기록된 내용으로만 초안을 써요. 기록에 없는 건 지어내지 않고 빈칸으로 남겨요.</p>
    </Card>
    {result && (
      <MatchingResults
        key={result.id}
        result={result}
        headingRef={resultHeadingRef}
        onEdit={(id, editedText) => setResult((previous) => ({
          ...previous,
          answers: previous.answers.map((answer) => answer.id === id ? { ...answer, editedText } : answer),
        }))}
      />
    )}
    </>
  );
}
