import MarkedTitle from "./MarkedTitle";

// 노란 형광펜 제목(MarkedTitle) + 내용으로 된 한 구역이다(Figma 11/15).
// size: md는 입력 팝업(새 프로젝트·내 정보 수정)·회원가입, lg는 자소서 매칭 입력 카드의 구역 제목이다.
// as: 제목 태그(기본 h3. 페이지 바로 아래 구역이면 h2).
// note: 제목 옆의 작은 안내(예: '· 중복 선택 가능' 글자, '선택' 캡슐).
// 제목 id(id)를 안쪽 입력칸이나 칩 묶음의 aria-labelledby로 쓴다.
const SIZE_CLASSES = {
  md: { section: "gap-4", head: "items-baseline gap-1" },
  lg: { section: "gap-3.5", head: "items-center gap-3" },
};

export default function MarkedSection({ id, title, note, size = "md", as, className = "", children }) {
  const sizeClasses = SIZE_CLASSES[size];
  return (
    <section aria-labelledby={id} className={`flex min-w-0 flex-col ${sizeClasses.section} ${className}`}>
      <div className={`flex ${sizeClasses.head}`}>
        <MarkedTitle as={as} id={id} size={size}>{title}</MarkedTitle>
        {note && <div className="text-caption text-ink-500">{note}</div>}
      </div>
      {children}
    </section>
  );
}
