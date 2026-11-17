// 노란 형광펜이 깔린 삼립호빵체 제목이다(Figma 11/15 입력 구역 제목).
// 형광펜은 글자 길이만큼만 깔리도록 제목 폭을 글자에 맞춘다(w-fit).
// size: md는 입력 팝업·회원가입·프로젝트 기록(16px), lg는 자소서 매칭·회고 자료 카드(19px)의 구역 제목이다.
// as: 제목 태그(h2·h3, 라벨 안이면 span). id는 구역이나 입력 묶음의 aria-labelledby로 쓴다.
const SIZE_CLASSES = {
  md: {
    title: "text-[16px] leading-[22px] tracking-[-0.32px]",
    marker: "top-3 h-[9px]",
  },
  lg: {
    title: "text-[19px] leading-7 tracking-[-0.15px]",
    marker: "top-[17px] h-[10px]",
  },
};

export default function MarkedTitle({ as: Tag = "h3", id, size = "md", className = "", children }) {
  const sizeClasses = SIZE_CLASSES[size];
  return (
    <Tag id={id} className={`relative isolate block w-fit px-0.5 font-display text-ink-strong ${sizeClasses.title} ${className}`}>
      <span aria-hidden="true" className={`absolute right-0 -left-1 -z-10 rounded-[5px] bg-shape-yellow ${sizeClasses.marker}`} />
      {children}
    </Tag>
  );
}
