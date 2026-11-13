import Image from "next/image";
import Badge from "@/components/ui/Badge";

// AI가 찾은 더 물어볼 곳(R-15·16)의 진행 목록이다(11/13 디자인).
// 질문마다 상태 점(답함 ✓, 건너뜀 –, 지금 번호, 남음 번호)과 성격 태그, 근거 문장을 세로 선으로 잇는다.
// 맨 위 요약은 답함·건너뜀·진행 중·남음 개수다. 건너뛴 질문이 없으면 '건너뜀'은 빼고, 질문을 다 끝냈으면 '진행 중'도 뺀다.
// 상태별 회색들은 이 목록에서만 쓰는 값이라 토큰으로 두지 않는다.
const STATES = {
  now: {
    label: "지금 답하는 중",
    item: "bg-yellow-100 shadow-[inset_0_0_0_2px_var(--color-yellow-400)]",
    dot: "bg-yellow-400 text-ink-strong shadow-[0_0_0_4px_#fff1c2]",
    status: "font-bold text-yellow-700",
    quote: "font-bold text-ink-strong",
  },
  done: {
    label: "답했어요",
    item: "bg-canvas",
    dot: "bg-ink-strong",
    status: "font-bold text-ink",
    quote: "text-ink-faint",
  },
  skip: {
    label: "건너뛰었어요 · 답 안 함",
    item: "bg-[#fafaf8] shadow-[inset_0_0_0_1.5px_#ecece8]",
    dot: "border-[1.5px] border-[#b9bbc0] bg-white text-[15px] text-ink-faint",
    status: "text-ink-faint",
    quote: "text-ink-faint",
  },
  next: {
    label: "앞으로 답할 질문",
    item: "bg-white shadow-[inset_0_0_0_1.5px_#ecece8]",
    dot: "border-[1.5px] border-dashed border-[#b9bbc0] bg-white text-[#9a9da4]",
    status: "text-[#9a9da4]",
    quote: "text-ink-500",
  },
};

const SUMMARY_DOTS = {
  done: "bg-ink-strong",
  skip: "border-[1.5px] border-[#b9bbc0] bg-white",
  now: "bg-yellow-400 shadow-[0_0_0_2px_#fff1c2]",
  next: "border-[1.5px] border-dashed border-[#b9bbc0] bg-white",
};

function questionState(question, index, currentIndex) {
  if (index === currentIndex) return "now";
  if (question.status === "ANSWERED") return "done";
  if (question.status === "SKIPPED") return "skip";
  return "next";
}

// currentIndex: 지금 여는 질문(질문을 다 끝냈으면 null).
export default function QuestionProgressList({ questions, currentIndex }) {
  const states = questions.map((question, index) => questionState(question, index, currentIndex));
  const count = (state) => states.filter((item) => item === state).length;
  const summary = [
    { state: "done", label: "답함", value: count("done") },
    { state: "skip", label: "건너뜀", value: count("skip"), hidden: !count("skip") },
    { state: "now", label: "진행 중", value: count("now"), hidden: currentIndex === null },
    { state: "next", label: "남음", value: count("next") },
  ].filter(({ hidden }) => !hidden);

  return (
    <>
      <p className="mt-2.5 flex flex-wrap gap-x-3.5 gap-y-1.5 text-[12.5px] leading-5 text-ink-500">
        {summary.map(({ state, label, value }) => (
          <span key={state} className="inline-flex items-center gap-1.5">
            <i aria-hidden="true" className={`size-2.5 rounded-full ${SUMMARY_DOTS[state]}`} />
            {label} <b className="text-ink-strong">{value}</b>
          </span>
        ))}
      </p>
      <ol className="mt-3.5 flex flex-col gap-2.5">
        {questions.map((question, index) => {
          const state = states[index];
          const style = STATES[state];
          const isLast = index === questions.length - 1;
          return (
            <li key={question.questionId} aria-current={state === "now" ? "step" : undefined} className={`relative flex items-start gap-3 rounded-[14px] py-3 pr-3.5 pl-3 ${style.item}`}>
              {/* 다음 질문과 잇는 세로 선. 끝낸 질문 아래는 진하게(25%) 긋는다. */}
              {!isLast && (
                <span aria-hidden="true" className={`absolute top-10 -bottom-3 left-6 w-0.5 ${state === "done" || state === "skip" ? "bg-ink-strong/25" : "bg-[#e4e4de]"}`} />
              )}
              <span aria-hidden="true" className={`relative z-[1] grid size-[26px] shrink-0 place-items-center rounded-full text-caption leading-none font-bold ${style.dot}`}>
                {state === "done" ? <Image src="/images/common/check-12-white.svg" alt="" width={12} height={12} /> : state === "skip" ? "–" : index + 1}
              </span>
              <div className="flex min-w-0 flex-col gap-[5px]">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={state === "now" ? "tag" : "tag-muted"} size="sm">{question.tag}</Badge>
                  <span className={`text-caption leading-4 whitespace-nowrap ${style.status}`}>
                    {state === "now" && <i aria-hidden="true" className="question-blink mr-1.5 inline-block size-1.5 rounded-full bg-[#e0a800] align-[1px]" />}
                    {style.label}
                  </span>
                </div>
                {question.quote && <p className={`text-[13.5px] leading-5 [overflow-wrap:anywhere] ${style.quote}`}>“{question.quote}”</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
