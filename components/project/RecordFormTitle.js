// 기록 추가·수정 상자 맨 위의 제목줄(11/13 디자인): 삼립호빵체 제목, 오른쪽 날짜, 아래 선.
// tone="dark": AI 질문처럼 진한 상자일 때 흰 글씨와 흰 선을 쓴다.
export default function RecordFormTitle({ id, date, tone = "light", children }) {
  const isDark = tone === "dark";
  return (
    <div className={`flex items-center justify-between gap-3 border-b pb-3 ${isDark ? "border-white" : "border-ink-strong"}`}>
      <h2 id={id} className={`font-display text-[18px] leading-[29px] ${isDark ? "text-white" : "text-ink-strong"}`}>{children}</h2>
      {date && <p className={`text-label ${isDark ? "text-locked" : "text-ink-subtle"}`}>{date}</p>}
    </div>
  );
}
