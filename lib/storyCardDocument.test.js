import assert from "node:assert/strict";
import test from "node:test";
import { withoutDocumentTitle } from "./storyCardDocument.js";

test("전문 첫 제목을 제외하고 본문 소제목·목록·줄바꿈을 보존한다", () => {
  const body = "- 시기: 아이디어톤\n\n## 상황\n첫 화면을 수정했습니다.\n\n## 배운 점\n피드백 수용";
  const result = withoutDocumentTitle(`# 이전 제목\n\n${body}`, "수정한 카드 제목");
  assert.equal(result, body);
  assert.equal(withoutDocumentTitle(result, "수정한 카드 제목"), body);
  assert.equal(withoutDocumentTitle(`\r\n제목\r\n\r\n본문`, "제목"), "본문");
  assert.equal(withoutDocumentTitle("## 제목\n\n본문", "제목"), "본문");
});

test("제목이 없는 전문과 빈 문서는 유지하며 본문 안의 제목은 삭제하지 않는다", () => {
  for (const text of ["", "## 상황\n내용", "그날 한 일\n\n# 본문 속 제목", "- 시기: 프로젝트\n\n## 상황"]) {
    assert.equal(withoutDocumentTitle(text, "카드 제목"), text);
  }
  assert.equal(withoutDocumentTitle(null, "카드 제목"), "");
  assert.equal(withoutDocumentTitle("# 제목", "제목"), "");
});
