import assert from "node:assert/strict";
import test from "node:test";
import { normalizeAttachmentUrl } from "./attachmentUrl.js";

test("프로토콜이 없는 주소와 앞뒤 공백을 완전한 HTTPS URL로 정규화한다", () => {
  assert.equal(normalizeAttachmentUrl(" github.com/lion/sajarok "), "https://github.com/lion/sajarok");
  assert.equal(normalizeAttachmentUrl("www.example.com"), "https://www.example.com/");
  assert.equal(normalizeAttachmentUrl("example.com:8080/path"), "https://example.com:8080/path");
  assert.equal(normalizeAttachmentUrl("//example.com/path"), "https://example.com/path");
});

test("명시한 HTTP(S)와 경로·쿼리·프래그먼트를 보존한다", () => {
  for (const url of ["http://example.com/path?a=1&b=2#section", "https://github.com/lion/sajarok"]) {
    assert.equal(normalizeAttachmentUrl(url), url);
    assert.equal(normalizeAttachmentUrl(normalizeAttachmentUrl(url)), url);
  }
});

test("빈 입력·잘못된 주소·다른 프로토콜·인증정보가 포함된 주소는 거부한다", () => {
  for (const value of ["", "  ", "잘못된 주소", "github", "/relative/path", "https://", "ftp://example.com/file", "javascript:alert(1)", "data:text/plain,test", "https://user:password@example.com"]) {
    assert.equal(normalizeAttachmentUrl(value), null, value);
  }
});
