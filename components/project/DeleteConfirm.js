import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";

// 기록 삭제(12-c)와 프로젝트 삭제(12-g)가 함께 쓰는 확인 상자다. 누른 자리에 바로 열린다.
// 11/13 디자인: 연분홍 바탕, 굵은 제목 줄, 오른쪽 아래 '취소'·'지우기'.
export default function DeleteConfirm({ title, message, onCancel, onConfirm }) {
  return (
    <div role="alert" className="flex flex-col gap-2.5 rounded-[14px] bg-tint-red px-3.5 py-3 text-body-sm leading-[22.4px] text-ink">
      <p>
        <b className="font-display font-normal">{title}</b>
        <br />
        {message}
      </p>
      <div className="flex items-center justify-end gap-3">
        {/* 삭제 버튼을 눌러도 포커스를 잃지 않도록 안전한 쪽인 취소로 옮긴다. */}
        <TextLink size="sm" autoFocus onClick={onCancel}>취소</TextLink>
        <Button variant="danger" size="sm" className="rounded-full" onClick={onConfirm}>지우기</Button>
      </div>
    </div>
  );
}
