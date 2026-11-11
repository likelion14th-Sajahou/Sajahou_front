// 기록에서 찾지 못한 내용 안내(⚑). 프로젝트·회고의 빈칸 안내와 자료 부족 안내가 같은 디자인을 쓴다.
// labels는 기존 빈칸 문구, children은 자료 부족 등 별도 안내 문구에 쓴다.
export default function BlankFieldsNotice({ labels = [], children }) {
  if (labels.length === 0 && !children) {
    return null;
  }

  return (
    <p className="flex items-start gap-2 rounded-xl bg-tint-yellow px-3 py-2.5 text-label leading-[20.8px] text-tint-yellow-ink">
      <span aria-hidden="true">⚑</span>
      {children ?? `${labels.join(", ")}은(는) 기록에서 찾지 못해 비워 뒀어요.`}
    </p>
  );
}
