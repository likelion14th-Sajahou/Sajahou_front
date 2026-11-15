import assert from "node:assert/strict";
import test from "node:test";
import { getAiErrorMessage, getRequestErrorMessage } from "./requestErrorMessage.js";

test("회고 저장과 카드 생성 모두 서버의 작성 기간 제한을 안내한다", () => {
  const failure = { code: "DEADLINE_PASSED", status: 409, kind: "http" };
  const message = "회고 작성 가능 기간이 지났어요. 더 이상 수정하거나 카드를 만들 수 없어요.";
  assert.equal(getRequestErrorMessage(failure, "저장 실패"), message);
  assert.equal(getAiErrorMessage(failure, "초안 생성 실패"), message);
});

test("네트워크·AI 오류 및 알 수 없는 오류의 기존 안내를 유지한다", () => {
  assert.equal(getRequestErrorMessage({ kind: "network" }, "실패"), "연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요.");
  assert.equal(getAiErrorMessage({ code: "AI_IN_PROGRESS" }, "실패"), "AI가 만들고 있어요. 잠시 후 다시 시도해 주세요.");
  assert.equal(getAiErrorMessage({ code: "INVALID_STATE" }, "실패"), "실패");
});
