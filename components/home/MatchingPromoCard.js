import Image from "next/image";
import Link from "next/link";
import DrawnBorder from "@/components/ui/DrawnBorder";

export default function MatchingPromoCard() {
  return (
    <Link href="/matching" className="relative flex min-h-[220px] flex-col items-start justify-end rounded-[28px] bg-[#fdd87b] px-[22px] pb-[22px] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
      <DrawnBorder variant="matching-card" />
      <span className="group absolute top-3 right-2 h-[98px] w-[159px]">
        <Image src="/images/home/matching-eyes.png" alt="" width={139} height={78} className="absolute top-2.5 left-2.5 group-hover:invisible" />
        <Image src="/images/home/matching-arrow.png" alt="" width={46} height={69} className="invisible absolute top-[19px] left-[88px] group-hover:visible" />
      </span>
      <span className="relative font-display text-[32px] leading-[34px]">지원할 공고가<br />생겼나요?</span>
    </Link>
  );
}
