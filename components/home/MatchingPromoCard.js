import Image from "next/image";
import Link from "next/link";
import DrawnBorder from "@/components/ui/DrawnBorder";

export default function MatchingPromoCard() {
  return (
    <Link href="/matching" className="relative flex min-h-[220px] flex-col items-start justify-end rounded-[28px] bg-[#fdd87b] px-6 pb-6 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
      <DrawnBorder variant="matching-card" />
      <span className="group absolute top-3.5 right-4 h-[98px] w-[159px]">
        <span className="home-matching-icon absolute top-2.5 left-2.5 h-[78px] w-[139px] group-hover:opacity-0">
          <Image src="/images/home/matching-eyes.png" alt="" fill sizes="139px" className="object-contain" />
        </span>
        <span className="home-matching-icon absolute top-[19px] left-[88px] h-[69px] w-[46px] opacity-0 group-hover:opacity-100">
          <Image src="/images/home/matching-arrow.png" alt="" fill sizes="46px" className="object-contain" />
        </span>
      </span>
      <span className="relative font-display text-[32px] leading-[34px]">지원할 공고가<br />생겼나요?</span>
    </Link>
  );
}
