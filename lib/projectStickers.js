import { FOOTPRINT_SECTIONS } from "./mock/myRecord.js";
import { projectBadgeImage } from "./stickerBadges.js";

// 14기 커리큘럼의 프로젝트 발표 주는 각 프로젝트 구간의 마지막 주다(A-03).
// code는 프로젝트 종류(category)다. 지급 판정은 /footprints 주마다의 stickers다.
export const PROJECT_STICKERS = [
  { code: "IDEATHON", sectionId: "ideathon" },
  { code: "HACKATHON", sectionId: "hackathon" },
  { code: "JUNGKATHON", sectionId: "central-hackathon" },
].map(({ code, sectionId }) => {
  const section = FOOTPRINT_SECTIONS.find((item) => item.id === sectionId);
  return { code, sectionId, week: section.endWeek, kind: "milestone", label: section.label,
    image: projectBadgeImage(code),
    title: section.label, shape: "sun", color: "yellow" };
});

// 프로젝트 종류(category)별 발표 주. 그 종류의 프로젝트를 하나라도 완료하면 /footprints의 이 주 stickers에 붙는다.
const sectionEndWeek = (id) => FOOTPRINT_SECTIONS.find((item) => item.id === id).endWeek;
export const CATEGORY_PRESENTATION_WEEKS = {
  IDEATHON: sectionEndWeek("ideathon"),
  HACKATHON: sectionEndWeek("hackathon"),
  JUNGKATHON: sectionEndWeek("central-hackathon"),
};
