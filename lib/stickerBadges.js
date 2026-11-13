// 일반 주차는 밝은 별 5종을 순환하고, 프로젝트 회고 주는 전용 스티커를 사용한다.
// 홈 스티커 보드와 나의 사자록 사자 발자국이 같은 규칙을 쓰도록 여기에 둔다.

const STICKER_DIR = "/images/stickers";

const WEEK_BADGES = ["star-five", "star-four", "star-four-rounded", "star-eight", "star-eight-rounded"];

// 프로젝트 회고 주의 전용 스티커(A-03): 아이디어톤 트로피, 해커톤 월계관.
// 중커톤은 커리큘럼 sectionId로 연결한다. 새 API enum을 추가하지 않는다.
export const PROJECT_BADGES = { IDEATHON: "trophy", HACKATHON: "laurel", "central-hackathon": "medal" };

const badgePath = (name) => `${STICKER_DIR}/${name}.png`;

export function weekBadgeImage(week) {
  const index = (((week - 1) % WEEK_BADGES.length) + WEEK_BADGES.length) % WEEK_BADGES.length;
  return badgePath(WEEK_BADGES[index]);
}

export function projectBadgeImage(code) {
  const name = PROJECT_BADGES[code];
  return name ? badgePath(name) : null;
}

// 프로젝트 이름(또는 '아이디어톤 기록' 같은 출처 이름)으로 그 프로젝트의 스티커를 고른다.
// 아이디어톤 트로피, 해커톤 월계관(중앙해커톤 포함), 그 밖에는 중커톤 메달이다. 스토리 카드와 프로젝트 화면이 함께 쓴다.
export function projectBadgeImageByName(name = "") {
  const code = /아이디어톤/.test(name) ? "IDEATHON" : /해커톤/.test(name) ? "HACKATHON" : "central-hackathon";
  return projectBadgeImage(code);
}

// 프로젝트 기록 타임라인 왼쪽에 오래된 기록부터 차례로 붙는 상장 스티커 6종(11/13 디자인).
const RECORD_BADGES = ["rosette", "medal", "star-trophy", "certificate", "medal-striped", "ribbon"];

export function recordBadgeImage(order) {
  const index = ((order % RECORD_BADGES.length) + RECORD_BADGES.length) % RECORD_BADGES.length;
  return badgePath(RECORD_BADGES[index]);
}
