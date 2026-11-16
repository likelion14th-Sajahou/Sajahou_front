import Image from "next/image";
import { projectBadgeImage } from "@/lib/stickerBadges";

// HTML의 8종 순서. 기존 Figma 공용 스티커를 사용하고 없는 두 모양만 보충한다.
const STICKERS = [
  "star-four-rounded", "star-five", "star-four", "star-six",
  "star-four-soft", "star-eight", "flower", "star-eight-rounded",
];

export function CurrentWeekSticker({ small = false }) {
  return <Image src="/images/characters/cloud-current.png" alt=""
    width={small ? 16 : 28} height={small ? 14 : 24}
    style={{ width: small ? 16 : 28, height: small ? 14 : 24 }}
    className={small ? "shrink-0 object-contain" : "step-wobble shrink-0 object-contain"} />;
}

// category: 프로젝트 스티커(아이디어톤 트로피, 중앙해커톤 월계관, 중커톤 메달). 없으면 주차별 회고 스티커다.
export default function FootprintSticker({ week, category, size }) {
  const projectImage = category ? projectBadgeImage(category) : null;
  const src = projectImage ?? `/images/stickers/${STICKERS[week % STICKERS.length]}.png`;
  const dimension = size ?? (projectImage ? 34 : 26);

  return <Image src={src} alt="" width={dimension} height={dimension}
    style={{ width: dimension, height: dimension }} className="shrink-0 object-contain" />;
}
