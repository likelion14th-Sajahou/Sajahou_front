// 입력 팝업의 한 구역이다(Figma 11/15 팝업): 노란 형광펜이 깔린 삼립호빵체 제목 + 내용. 제목과 내용 사이는 16px.
// note: 제목 옆의 작은 회색 안내(예: '· 중복 선택 가능').
// 제목 id(id)를 안쪽 입력칸이나 칩 묶음의 aria-labelledby로 쓴다.
export default function MarkedSection({ id, title, note, children }) {
  return (
    <section aria-labelledby={id} className="flex min-w-0 flex-col gap-4">
      <div className="flex items-baseline gap-1">
        <h3 id={id} className="relative isolate px-0.5 font-display text-[16px] leading-[22px] tracking-[-0.32px] text-ink-strong">
          <span aria-hidden="true" className="absolute top-3 right-0 -left-1 -z-10 h-[9px] rounded-[5px] bg-shape-yellow" />
          {title}
        </h3>
        {note && <p className="text-caption text-ink-500">{note}</p>}
      </div>
      {children}
    </section>
  );
}
