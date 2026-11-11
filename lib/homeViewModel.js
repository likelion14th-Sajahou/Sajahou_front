import { FOOTPRINT_SECTIONS, FOOTPRINT_WEEKS } from "./mock/myRecord.js";
import { recordHref } from "./myRecordNavigation.js";

export const HOME_HERO_CONTENT = {
  NOT_STARTED: { title: "이번 주 이야기를\n남겨 볼까요", cta: "회고 쓰기" },
  IN_PROGRESS: { title: "이번 주 이야기를\n남겨 볼까요", cta: "이어 쓰기" },
  COMPLETED: { title: "이번 주 이야기를\n남겨 볼까요", cta: "다시 보기" },
  RESTED: { title: "이번 주는\n쉬어 가는 주예요", cta: "이번 주 보기" },
};

export function homeStickers(home) {
  // 선정·개수는 서버가 결정한다. 선택된 주차를 바꾸지 않고 화면 배치만 오름차순으로 맞춘다.
  const stickers = home.stickers.recentWeekNumbers.toSorted((a, b) => a - b).map((week) => {
    const decoration = FOOTPRINT_WEEKS.find((item) => item.week === week);
    return { week, kind: "earned", label: String(week), title: `${week}주차`,
      shape: decoration?.shape ?? "circle", color: decoration?.color ?? "blue" };
  });
  if (home.stickers.showThisWeekSlot) {
    stickers.push({ week: home.currentWeek.weekNumber, kind: "current", label: String(home.currentWeek.weekNumber) });
  }
  // 운영 일정에 정의된 다음 발표 주차의 예정 자리다. 지급된 projectStickers의 매핑은 계약 확정 후 추가한다.
  const nextProject = FOOTPRINT_SECTIONS.find((section) => section.isProject && section.endWeek >= home.currentWeek.weekNumber);
  if (nextProject && !stickers.some((item) => item.week === nextProject.endWeek)) {
    stickers.push({ week: nextProject.endWeek, kind: "upcoming", label: nextProject.label, title: nextProject.label });
  }
  return stickers;
}

export function homeStickerHref({ kind, week }) {
  if (kind === "upcoming") return null;
  if (kind === "current") return "/retrospective";
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
