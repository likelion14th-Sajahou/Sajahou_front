import Button from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";

// 기록 삭제(12-c)와 프로젝트 삭제(12-g)가 함께 쓰는 확인 상자다. 누른 자리에 바로 열린다.
export default function DeleteConfirm({ title, message, onCancel, onConfirm }) {
  return (
    <div role="alert" className="flex flex-col gap-2.5 rounded-[14px] border border-[#f3c4be] bg-[#fff4f2] px-3.5 py-3">
      <p className="text-body-sm text-ink">
        {title}
        <br />
        {message}
      </p>
      <div className="flex items-center justify-end gap-3">
        {/* 삭제 버튼을 눌러도 포커스를 잃지 않도록 안전한 쪽인 취소로 옮긴다. */}
        <TextLink size="sm" autoFocus onClick={onCancel}>취소</TextLink>
        <Button variant="danger" size="sm" onClick={onConfirm}>지우기</Button>
      </div>
    </div>
  );
}
