import MarkedSection from "@/components/ui/MarkedSection";

// '계정' 구역: 형광펜 제목 + 바꿀 수 없는 Google 이메일 칸. 회원가입과 내 정보 수정 팝업이 같이 쓴다.
// as: 제목 태그(회원가입은 페이지 바로 아래라 h2, 팝업은 팝업 제목 아래라 기본 h3).
export default function GoogleAccountInfo({ id, email, as, className = "" }) {
  return (
    <MarkedSection id={id} title="계정" as={as} className={className}>
      <p className="flex min-h-12 items-center rounded-[14px] bg-canvas px-4 py-3 text-body leading-6 break-all text-ink-strong">
        <span className="sr-only">Google 계정 </span>{email}
      </p>
    </MarkedSection>
  );
}
