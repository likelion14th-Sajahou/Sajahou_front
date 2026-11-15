import { FOOTPRINT_WEEKS } from "./mock/myRecord.js";
import { recordHref } from "./myRecordNavigation.js";
import { PROJECT_STICKERS } from "./projectStickers.js";
import { selectBoardStickers } from "./selectBoardStickers.js";
import { weekBadgeImage } from "./stickerBadges.js";

export const HOME_HERO_CONTENT = {
  NOT_STARTED: { title: "이번 주 이야기를\n남겨 볼까요", cta: "회고 쓰기" },
  IN_PROGRESS: { title: "이번 주 이야기를\n남겨 볼까요", cta: "이어 쓰기" },
  COMPLETED: { title: "이번 주 이야기를\n남겨 볼까요", cta: "다시 보기" },
  RESTED: { title: "이번 주는\n쉬어 가는 주예요", cta: "이번 주 보기" },
};

// 사자 발자국과 같은 규칙으로 한 주에 한 칸이다. 그 주에 프로젝트 스티커(stickers)가 있으면 프로젝트 스티커,
// 없고 회고를 완료했으면 회고 스티커다. 프로젝트 스티커는 발표 주 전(UPCOMING)에 붙어도 보여 준다.
// 전체 주를 보고 고르므로 최근 10주 밖의 프로젝트 스티커도 남는다.
export function homeStickers(footprints) {
  const byWeek = new Map();
  for (const { weekNumber: week, status, stickers = [] } of footprints.weeks) {
    if (byWeek.has(week)) continue;
    const project = PROJECT_STICKERS.find((item) => item.code === stickers[0]);
    if (project) byWeek.set(week, { ...project, week });
    else if (status === "COMPLETED") byWeek.set(week, { week, kind: "earned", label: `${week}주차`, title: `${week}주차`, image: weekBadgeImage(week) });
  }
  // 받은 프로젝트 우선, 남은 칸은 최근 회고, 최종 표시는 주차 오름차순이다.
  return selectBoardStickers([...byWeek.values()]);
}

export function homeStickerHref({ week }) {
  return recordHref(new URLSearchParams(), { tab: "footprints", week });
}

export function homeRecentCards(cards) {
  return cards.filter((card) => ["SESSION", "ASSIGNMENT"].includes(card.type)).slice(0, 3).map((card) => {
    const decoration = FOOTPRINT_WEEKS.find((item) => item.week === card.weekNumber);
    return { id: String(card.cardId), title: card.title, type: card.type.toLowerCase(),
      shape: card.type === "ASSIGNMENT" ? "square" : decoration?.shape ?? "circle",
      color: card.type === "ASSIGNMENT" ? "green" : decoration?.color ?? "blue" };
  });
}

export function homeCardHref(cardId) {
  return recordHref(new URLSearchParams(), { tab: "cards", card: cardId });
}
