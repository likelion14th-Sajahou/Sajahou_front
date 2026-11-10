import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";

// 확인 UI만 담당한다. 자료 변경 감지와 답변 교체는 호출하는 쪽에서 처리한다.
export default function MaterialsChangeNotice({
  open,
  answerCount,
  onCancel,
  onContinue,
  onRegenerate,
  busy = false,
}) {
  if (!open) return null;

  return (
    <section
      role="alert"
      aria-labelledby="materials-change-title"
      aria-describedby="materials-change-description"
      className="flex min-w-0 flex-col gap-2.5 rounded-2xl border border-shape-peach bg-[#fff4e5] px-4 py-3.5"
    >
      <div className="min-w-0 text-body-sm break-keep">
        <h3 id="materials-change-title">자료가 바뀌었어요</h3>
        <p id="materials-change-description">
          질문을 새로 만들면 지금까지 쓴 답 {answerCount}개가 사라져요. 고친 자료를 반영하지 않고 이전 질문을 그대로 이어 쓸 수도 있어요.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-3.5 gap-y-2.5 pt-1">
        <TextLink onClick={onCancel} disabled={busy}>취소</TextLink>
        <div className="flex w-full min-w-0 flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row">
          <Button variant="secondary" onClick={onContinue} disabled={busy}>이전 질문 이어 쓰기</Button>
          <Button onClick={onRegenerate} disabled={busy}>질문 새로 만들기</Button>
        </div>
      </div>
    </section>
  );
}
