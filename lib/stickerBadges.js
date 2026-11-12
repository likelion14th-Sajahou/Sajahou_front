// 회고를 완료한 주에 붙는 스티커 그림(디자인 시스템 '스티커' 8종)을 고른다.
// 명세 H-04·A-03: 주차마다 다른 일러스트 스티커가 주차 순서대로 돌아가며 나오고, 프로젝트 회고 주는 전용 스티커를 쓴다.
// 홈 스티커 보드와 나의 사자록 사자 발자국이 같은 규칙을 쓰도록 여기에 둔다.

const STICKER_DIR = "/images/stickers";

// 주차 순서대로 돌아가며 쓰는 8종이다. 1주차가 첫 번째 스티커다.
export const WEEK_BADGES = ["certificate", "medal", "trophy", "laurel", "rosette", "ribbon", "star-trophy", "medal-striped"];

// 프로젝트 회고 주의 전용 스티커(A-03): 아이디어톤 트로피, 해커톤 월계관.
// 중커톤(메달)은 서버의 획득 enum이 아직 계약에 없어(lib/projectStickers.js) 정해지면 추가한다.
export const PROJECT_BADGES = { IDEATHON: "trophy", HACKATHON: "laurel" };

const badgePath = (name) => `${STICKER_DIR}/${name}.png`;

export function weekBadgeImage(week) {
  const index = (((week - 1) % WEEK_BADGES.length) + WEEK_BADGES.length) % WEEK_BADGES.length;
  return badgePath(WEEK_BADGES[index]);
}

export function projectBadgeImage(code) {
  const name = PROJECT_BADGES[code];
  return name ? badgePath(name) : null;
}
