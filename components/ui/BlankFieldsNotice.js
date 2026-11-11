// 기록에서 찾지 못해 비워 둔 칸 안내(⚑). 지어내지 않고 빈칸으로 둔다는 걸 알린다(C-01).
// 프로젝트 기록 정리(H-14)와 회고 카드 초안(R-20)이 함께 쓴다. labels가 비면 보이지 않는다.
export default function BlankFieldsNotice({ labels }) {
  if (labels.length === 0) {
    return null;
  }

  return (
    <p className="flex items-start gap-2 rounded-xl bg-tint-yellow px-3 py-2.5 text-label leading-[20.8px] text-tint-yellow-ink">
      <span aria-hidden="true">⚑</span>
      {labels.join(", ")}은(는) 기록에서 찾지 못해 비워 뒀어요.
    </p>
  );
}
