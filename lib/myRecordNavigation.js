const KEYS = ["tab", "section", "week", "type", "competencyId", "tag", "q", "card", "highlight"];
const SECTIONS = ["regular-1", "ideathon", "regular-2", "hackathon", "regular-3", "central-hackathon", "closing"];
export function readRecordLocation(params) {
  const weekText = params.get("week") ?? "";
  const week = /^\d+$/.test(weekText) && Number(weekText) >= 1 && Number(weekText) <= 39 ? Number(weekText) : undefined;
  const type = params.get("type")?.toLowerCase();
  const card = params.get("card") || undefined;
  const highlight = params.get("highlight") || undefined;
  const competencyId = params.get("competencyId") || undefined;
  const tag = params.get("tag") || undefined;
  const explicitTab = params.get("tab");
  return { tab: explicitTab === "footprints" ? "footprints"
    : explicitTab === "cards" || card || highlight || competencyId || tag ? "cards" : "footprints",
    section: SECTIONS.includes(params.get("section")) ? params.get("section") : "all",
    week, type: ["session", "assignment", "project"].includes(type) ? type : "all",
    card, highlight, competencyId, tag, q: params.get("q") ?? "" };
}
export function recordHref(params, changes = {}) {
  const next = new URLSearchParams();
  for (const key of KEYS) if (params.has(key)) next.set(key, params.get(key));
  for (const [key, value] of Object.entries(changes)) {
    if (!KEYS.includes(key)) continue;
    if (value === null || value === undefined || value === "" || value === "all") next.delete(key);
    else next.set(key, String(value));
  }
  const query = next.toString();
  return `/my-record${query ? `?${query}` : ""}`;
}
export function weekDestination(week, params = new URLSearchParams()) {
  if (week.status === "current") return "/retrospective";
  if (week.status !== "done" || !week.cardIds.length) return null;
  return recordHref(params, { tab: "cards", week: week.week,
    card: week.cardIds.length === 1 ? week.cardIds[0] : null,
    highlight: null, type: null, competencyId: null, tag: null, q: null });
}
