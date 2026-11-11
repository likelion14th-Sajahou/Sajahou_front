import { FOOTPRINT_SECTIONS, FOOTPRINT_WEEKS } from "./mock/myRecord.js";
import { recordHref } from "./myRecordNavigation.js";
import { PROJECT_STICKERS } from "./projectStickers.js";

export const HOME_HERO_CONTENT = {
  NOT_STARTED: { title: "이번 주 이야기를\n남겨 볼까요", cta: "회고 쓰기" },
  IN_PROGRESS: { title: "이번 주 이야기를\n남겨 볼까요", cta: "이어 쓰기" },
  COMPLETED: { title: "이번 주 이야기를\n남겨 볼까요", cta: "다시 보기" },
  RESTED: { title: "이번 주는\n쉬어 가는 주예요", cta: "이번 주 보기" },
};

export function homeStickers(home) {
  // 획득 여부는 서버 응답만 사용한다. 고정 목록으로 걸러 중복 enum과 미지원 enum을 안전하게 처리한다.
  const projectStickers = PROJECT_STICKERS.filter((item) => home.stickers.projectStickers.includes(item.code));
  const projectWeeks = new Set(projectStickers.map((item) => item.week));
  // 선정·개수는 서버가 결정한다. 선택된 주차를 바꾸지 않고 화면 배치만 오름차순으로 맞춘다.
  const stickers = home.stickers.recentWeekNumbers.filter((week) => !projectWeeks.has(week)).toSorted((a, b) => a - b).map((week) => {
    const decoration = FOOTPRINT_WEEKS.find((item) => item.week === week);
    return { week, kind: "earned", label: String(week), title: `${week}주차`,
      shape: decoration?.shape ?? "circle", color: decoration?.color ?? "blue" };
  });
  if (home.stickers.showThisWeekSlot) {
    stickers.push({ week: home.currentWeek.weekNumber, kind: "current", label: String(home.currentWeek.weekNumber) });
  }
  stickers.push(...projectStickers);
  // 프로젝트는 최근 10개 제한 밖이어도 모두 포함하고, 다음 프로젝트 예정 자리를 함께 보여 준다.
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
