// 노란 형광펜이 깔린 삼립호빵체 제목 + 내용으로 된 한 구역이다(Figma 11/15).
// size: md는 입력 팝업(새 프로젝트·내 정보 수정), lg는 자소서 매칭 입력 카드의 구역 제목이다.
// note: 제목 옆의 작은 안내(예: '· 중복 선택 가능' 글자, '선택' 캡슐).
// 제목 id(id)를 안쪽 입력칸이나 칩 묶음의 aria-labelledby로 쓴다.
const SIZE_CLASSES = {
  md: {
    section: "gap-4",
    head: "items-baseline gap-1",
    title: "text-[16px] leading-[22px] tracking-[-0.32px]",
    marker: "top-3 h-[9px]",
  },
  lg: {
    section: "gap-3.5",
    head: "items-center gap-3",
    title: "text-[19px] leading-7 tracking-[-0.15px]",
    marker: "top-[17px] h-[10px]",
  },
};

export default function MarkedSection({ id, title, note, size = "md", className = "", children }) {
  const sizeClasses = SIZE_CLASSES[size];
  return (
    <section aria-labelledby={id} className={`flex min-w-0 flex-col ${sizeClasses.section} ${className}`}>
      <div className={`flex ${sizeClasses.head}`}>
        <h3 id={id} className={`relative isolate px-0.5 font-display text-ink-strong ${sizeClasses.title}`}>
          <span aria-hidden="true" className={`absolute right-0 -left-1 -z-10 rounded-[5px] bg-shape-yellow ${sizeClasses.marker}`} />
          {title}
        </h3>
        {note && <div className="text-caption text-ink-500">{note}</div>}
      </div>
      {children}
    </section>
  );
}
