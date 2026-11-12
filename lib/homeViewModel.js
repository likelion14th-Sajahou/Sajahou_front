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

export function homeStickers(footprints) {
  // 전체 완료 주차를 사용해 최근 10주 밖의 프로젝트 스티커도 보존한다.
  const completedWeeks = [...new Set(footprints.weeks
    .filter(({ status }) => status === "COMPLETED").map(({ weekNumber }) => weekNumber))];
  const stickers = completedWeeks.map((week) => {
    const project = PROJECT_STICKERS.find((item) => item.week === week);
    if (project) return { ...project };
    return { week, kind: "earned", label: `${week}주차`, title: `${week}주차`, image: weekBadgeImage(week) };
  });
  // 받은 프로젝트 우선, 남은 칸은 최근 회고, 최종 표시는 주차 오름차순이다.
  return selectBoardStickers(stickers);
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
