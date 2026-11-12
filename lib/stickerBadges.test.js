import test from "node:test";
import assert from "node:assert/strict";
import { PROJECT_BADGES, WEEK_BADGES, projectBadgeImage, weekBadgeImage } from "./stickerBadges.js";

test("주차 스티커는 8종이 주차 순서대로 돌아가며 나온다", () => {
  assert.equal(weekBadgeImage(1), `/images/stickers/${WEEK_BADGES[0]}.png`);
  assert.equal(weekBadgeImage(8), `/images/stickers/${WEEK_BADGES[7]}.png`);
  assert.equal(weekBadgeImage(9), weekBadgeImage(1));
  assert.equal(weekBadgeImage(35), `/images/stickers/${WEEK_BADGES[2]}.png`);
});

test("프로젝트 회고 주는 전용 스티커를 쓰고, 모르는 프로젝트는 그림이 없다", () => {
  assert.equal(projectBadgeImage("IDEATHON"), `/images/stickers/${PROJECT_BADGES.IDEATHON}.png`);
  assert.equal(projectBadgeImage("HACKATHON"), "/images/stickers/laurel.png");
  assert.equal(projectBadgeImage("UNKNOWN"), null);
});
