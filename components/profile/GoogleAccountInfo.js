export default function GoogleAccountInfo({ email }) {
  return (
    <p className="mt-[22px] flex flex-wrap items-center gap-x-[10px] rounded-[14px] bg-canvas px-[14px] py-3">
      <span className="text-label leading-[19.5px] text-ink-subtle">Google 계정</span>
      <span className="break-all text-body leading-6">{email}</span>
    </p>
  );
}
