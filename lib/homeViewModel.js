import { FOOTPRINT_SECTIONS, FOOTPRINT_WEEKS } from "./mock/myRecord.js";
import { recordHref } from "./myRecordNavigation.js";
import { PROJECT_STICKERS } from "./projectStickers.js";
import { selectBoardStickers } from "./selectBoardStickers.js";

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
  const weekStickers = home.stickers.recentWeekNumbers.filter((week) => !projectWeeks.has(week)).map((week) => {
    const decoration = FOOTPRINT_WEEKS.find((item) => item.week === week);
    return { week, kind: "earned", label: `${week}주차`, title: `${week}주차`,
      shape: decoration?.shape ?? "circle", color: decoration?.color ?? "blue" };
  });
  // 기존 보드 규칙을 재사용한다: 프로젝트를 우선 포함한 획득 스티커 총 10개, 주차 오름차순.
  const stickers = selectBoardStickers([...weekStickers, ...projectStickers]);
  if (home.stickers.showThisWeekSlot) {
    stickers.push({ week: home.currentWeek.weekNumber, kind: "current", label: String(home.currentWeek.weekNumber) });
  }
  // 빈 자리·예정 자리는 획득 스티커 10개 제한과 별개다.
  const nextProject = FOOTPRINT_SECTIONS.find((section) => section.isProject && section.endWeek >= home.currentWeek.weekNumber);
  if (nextProject && !stickers.some((item) => item.week === nextProject.endWeek)) {
    stickers.push({ week: nextProject.endWeek, kind: "upcoming", label: nextProject.label, title: nextProject.label });
  }
  // 동료의 HomeContent와 동일하게 빈 자리까지 합친 최종 목록을 주차순으로 배치한다.
  return stickers.toSorted((a, b) => a.week - b.week);
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
