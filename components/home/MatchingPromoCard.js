import Link from "next/link";
import ShapeCharacter from "@/components/ui/ShapeCharacter";

export default function MatchingPromoCard() {
  return (
    <Link
      href="/matching"
      className="relative flex min-h-[220px] flex-1 flex-col items-start justify-end gap-3.5 overflow-hidden rounded-[28px] bg-ink px-6 pb-[22px] text-white"
    >
      <span aria-hidden="true">
        <ShapeCharacter shape="sunFine" color="yellow" size={150} className="absolute -top-[30px] -right-[34px]" />
        <ShapeCharacter shape="triangle" color="coral" size={44} className="absolute top-[18px] left-6 -rotate-12" />
        <ShapeCharacter shape="circle" color="blue" face="none" size={28} className="absolute top-[30px] left-[140px]" />
        <ShapeCharacter shape="square" color="green" size={40} className="absolute top-6 left-[186px] rotate-10" />
      </span>
      <span className="relative text-title leading-[27px]">
        지원할 공고가
        <br />
        생겼나요?
      </span>
      <span className="relative rounded-full bg-shape-yellow px-4 py-2 text-body-sm text-ink">
        자소서 매칭 →
      </span>
    </Link>
  );
}
