// '계정' 구역(Figma 회원가입 'Section · 계정'): 제목 + 바꿀 수 없는 Google 이메일 칸. 회원가입에서 쓴다(내 정보 수정 팝업은 형광펜 구역 제목을 쓴다).
export default function GoogleAccountInfo({ email, className = "" }) {
  return (
    <section aria-labelledby="google-account-title" className={`flex flex-col gap-4 ${className}`}>
      <h2 id="google-account-title" className="font-display text-body leading-[22px] text-ink">계정</h2>
      <p className="flex min-h-12 items-center rounded-[14px] bg-canvas px-4 py-3 text-body leading-6 break-all text-ink">
        <span className="sr-only">Google 계정 </span>{email}
      </p>
    </section>
  );
}
