import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { projectBadgeImageByName } from "@/lib/stickerBadges";
import FootprintSticker from "./FootprintSticker";
import { STORY_CARD_TYPES } from "./storyCardTypes";

// 목록과 상세에서 같은 Figma 스티커·유형 색상을 사용한다. 카드 데이터는 변경하지 않는다.
export function StoryCardIcon({ card, size = 38 }) {
  if (card.type !== "project") {
    return <FootprintSticker week={card.week} size={size} />;
  }
  return <Image src={projectBadgeImageByName(card.whenLabel)} alt="" width={size} height={size}
    style={{ width: size, height: size }} className="shrink-0 object-contain" />;
}

export function StoryCardTypeBadge({ type }) {
  return <Badge tone={type === "project" ? "dark" : "cream"} className="font-display tracking-[-0.15px]">
    {STORY_CARD_TYPES[type].label}
  </Badge>;
}
