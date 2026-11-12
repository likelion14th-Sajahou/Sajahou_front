import Image from "next/image";
import Link from "next/link";

// 홈 카드의 제목(Figma '섹션 제목 · 화살표'). href를 주면 제목 전체가 링크가 되고 오른쪽에 '>' 화살표가 붙는다.
export default function SectionHeader({ title, href, action }) {
  const heading = href ? (
    <Link href={href} className="inline-flex items-center gap-1 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
      {title}
      <Image src="/images/common/chevron-right-24.svg" alt="" width={24} height={24} />
    </Link>
  ) : title;

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <h2 className="font-display text-title leading-8 tracking-[-0.4px] text-ink">{heading}</h2>
      {action}
    </div>
  );
}
