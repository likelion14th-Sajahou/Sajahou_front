import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { projectBadgeImage, projectBadgeImageByName } from "@/lib/stickerBadges";
import FootprintSticker from "./FootprintSticker";
import { STORY_CARD_TYPES } from "./storyCardTypes";

// 목록과 상세에서 같은 Figma 스티커·유형 색상을 사용한다. 카드 데이터는 변경하지 않는다.
// 프로젝트 카드 스티커는 프로젝트 종류(category, #82)로 고르고, 종류가 없는 예전 카드만 프로젝트 이름으로 짐작한다.
export function StoryCardIcon({ card, size = 38 }) {
  if (card.type !== "project") {
    return <FootprintSticker week={card.week} size={size} />;
  }
  return <Image src={projectBadgeImage(card.category) ?? projectBadgeImageByName(card.whenLabel)} alt="" width={size} height={size}
    style={{ width: size, height: size }} className="shrink-0 object-contain" />;
}

export function StoryCardTypeBadge({ type }) {
  return <Badge tone={type === "project" ? "dark" : "cream"} className="font-display tracking-[-0.15px]">
    {STORY_CARD_TYPES[type].label}
  </Badge>;
}
