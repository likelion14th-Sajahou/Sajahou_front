import { FOOTPRINT_SECTIONS, FOOTPRINT_WEEKS } from "./mock/myRecord.js";
import { recordHref } from "./myRecordNavigation.js";
import { PROJECT_STICKERS } from "./projectStickers.js";
import { selectBoardStickers } from "./selectBoardStickers.js";
import { projectBadgeImage, weekBadgeImage } from "./stickerBadges.js";

export const HOME_HERO_CONTENT = {
  NOT_STARTED: { title: "이번 주 이야기를\n남겨 볼까요", cta: "회고 쓰기" },
  IN_PROGRESS: { title: "이번 주 이야기를\n남겨 볼까요", cta: "이어 쓰기" },
  COMPLETED: { title: "이번 주 이야기를\n남겨 볼까요", cta: "다시 보기" },
  RESTED: { title: "이번 주는\n쉬어 가는 주예요", cta: "이번 주 보기" },
};

export function homeStickers(home) {
  // 획득 여부는 서버 응답만 사용한다. 고정 목록으로 걸러 중복 enum과 미지원 enum을 안전하게 처리한다.
  // 일반 주차는 밝은 별 5종을 순환하고, 프로젝트는 전용 스티커다(stickerBadges.js).
  const projectStickers = PROJECT_STICKERS.filter((item) => home.stickers.projectStickers.includes(item.code))
    .map((item) => ({ ...item, image: projectBadgeImage(item.code) }));
  const projectWeeks = new Set(projectStickers.map((item) => item.week));
  const weekStickers = home.stickers.recentWeekNumbers.filter((week) => !projectWeeks.has(week)).map((week) => {
    const decoration = FOOTPRINT_WEEKS.find((item) => item.week === week);
    return { week, kind: "earned", label: `${week}주차`, title: `${week}주차`, image: weekBadgeImage(week),
      shape: decoration?.shape ?? "circle", color: decoration?.color ?? "blue" };
  });
  const slots = [];
  if (home.stickers.showThisWeekSlot) {
    const section = FOOTPRINT_SECTIONS.find(({ startWeek, endWeek }) => home.currentWeek.weekNumber >= startWeek && home.currentWeek.weekNumber <= endWeek);
    slots.push({ week: home.currentWeek.weekNumber, kind: "current", label: `${home.currentWeek.weekNumber}주차`, type: section?.isProject ? "project" : "retrospective" });
  }
  const nextProject = FOOTPRINT_SECTIONS.find((section) => section.isProject && section.endWeek >= home.currentWeek.weekNumber);
  if (nextProject && ![...weekStickers, ...projectStickers, ...slots].some((item) => item.week === nextProject.endWeek)) {
    slots.push({ week: nextProject.endWeek, kind: "upcoming", label: nextProject.label, title: nextProject.label });
  }
  // 이번 주·예정 자리까지 최대 10칸. 기존 프로젝트 우선 선택과 주차순 정렬은 유지한다.
  const stickers = selectBoardStickers([...weekStickers, ...projectStickers], 10 - slots.length);
  return [...stickers, ...slots].toSorted((a, b) => a.week - b.week);
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
