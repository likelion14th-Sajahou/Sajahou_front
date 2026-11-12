// 일반 주차는 밝은 별 5종을 순환하고, 프로젝트 회고 주는 전용 스티커를 사용한다.
// 홈 스티커 보드와 나의 사자록 사자 발자국이 같은 규칙을 쓰도록 여기에 둔다.

const STICKER_DIR = "/images/stickers";

const WEEK_BADGES = ["star-five", "star-four", "star-four-rounded", "star-eight", "star-eight-rounded"];

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
