import test from "node:test";
import assert from "node:assert/strict";
import { PROJECT_BADGES, projectBadgeImage, weekBadgeImage } from "./stickerBadges.js";

test("일반 주차는 별 5종만 순환하며 같은 주차의 모양은 유지된다", () => {
  const images = ["star-five", "star-four", "star-four-rounded", "star-eight", "star-eight-rounded"]
    .map((name) => `/images/stickers/${name}.png`);
  assert.deepEqual(Array.from({ length: 10 }, (_, index) => weekBadgeImage(index + 1)), [...images, ...images]);
  assert.equal(weekBadgeImage(35), images[4]);
});

test("프로젝트 회고 주는 전용 스티커를 쓰고, 모르는 프로젝트는 그림이 없다", () => {
  assert.equal(projectBadgeImage("IDEATHON"), `/images/stickers/${PROJECT_BADGES.IDEATHON}.png`);
  assert.equal(projectBadgeImage("HACKATHON"), "/images/stickers/laurel.png");
  assert.equal(projectBadgeImage("central-hackathon"), "/images/stickers/medal.png");
  assert.equal(projectBadgeImage("UNKNOWN"), null);
});
