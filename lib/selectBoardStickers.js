const BOARD_LIMIT = 10;

// 스티커 보드에는 최근 10개만 보여 주되, 프로젝트 스티커는 오래되어도 항상 포함한다(H-04).
export function selectBoardStickers(stickers, limit = BOARD_LIMIT) {
  const projectStickers = stickers.filter(({ kind }) => kind === "milestone");
  const sessionSlots = Math.max(limit - projectStickers.length, 0);
  const recentSessionStickers = stickers
    .filter(({ kind }) => kind !== "milestone")
    .toSorted((a, b) => b.week - a.week)
    .slice(0, sessionSlots);

  return [...projectStickers, ...recentSessionStickers].toSorted((a, b) => a.week - b.week);
}
