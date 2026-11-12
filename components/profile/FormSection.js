// 회원가입·내 정보 폼의 한 구역(Figma 회원가입 'Section'): 위쪽 구분선, 삼립호빵체 제목, 내용. 구역 사이 간격은 24px.
export default function FormSection({ id, title, children }) {
  return (
    <section aria-labelledby={id} className="border-t border-line py-6">
      <h2 id={id} className="mb-4 font-display text-body leading-[22px] text-ink">{title}</h2>
      {children}
    </section>
  );
}
