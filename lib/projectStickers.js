import { FOOTPRINT_SECTIONS } from "./mock/myRecord.js";

// 서버의 획득 enum을 기존 운영 일정·디자인에 연결한다. 중커톤 획득 enum은 아직 계약에 없다.
export const PROJECT_STICKERS = [
  { code: "IDEATHON", sectionId: "ideathon" },
  { code: "HACKATHON", sectionId: "hackathon" },
].map(({ code, sectionId }) => {
  const section = FOOTPRINT_SECTIONS.find((item) => item.id === sectionId);
  return { code, week: section.endWeek, kind: "milestone", label: section.label,
    title: section.label, shape: "sun", color: "yellow" };
});
