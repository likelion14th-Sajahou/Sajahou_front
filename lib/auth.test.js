import assert from "node:assert/strict";
import test from "node:test";
import { signupWithGoogle } from "./auth.js";

test("가입 API는 쿠키를 포함하고 명세의 필드만 JSON으로 보내며 data만 반환한다", async (context) => {
  const previousMode = process.env.NEXT_PUBLIC_AUTH_MODE;
  const previousBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  process.env.NEXT_PUBLIC_AUTH_MODE = "live";
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test/api/v1";
  context.after(() => {
    if (previousMode === undefined) delete process.env.NEXT_PUBLIC_AUTH_MODE;
    else process.env.NEXT_PUBLIC_AUTH_MODE = previousMode;
    if (previousBaseUrl === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL;
    else process.env.NEXT_PUBLIC_API_BASE_URL = previousBaseUrl;
  });
  const fields = { signupToken: "signup-test", name: "김사자", studentNo: "20231234",
    department: "소프트웨어학부", cohort: 14, part: "PLAN_DESIGN", privacyAgreed: true };
  const data = { user: { id: 1, name: "김사자", part: "PLAN_DESIGN" } };
  const controller = new AbortController();
  context.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(String(url), "https://api.example.test/api/v1/auth/signup");
    assert.equal(options.method, "POST");
    assert.equal(options.credentials, "include");
    assert.equal(options.cache, "no-store");
    assert.equal(options.headers.has("Authorization"), false);
    assert.equal(options.headers.get("Content-Type"), "application/json");
    assert.deepEqual(JSON.parse(options.body), fields);
    assert.ok(options.signal);
    return Response.json({ success: true, data, error: null }, { status: 201 });
  });
  assert.deepEqual(await signupWithGoogle({ ...fields, otherDepartment: "UI 전용 값" }, { signal: controller.signal }), data);
  const errors = { studentNo: "학번은 숫자 8자리로 입력해 주세요.", privacyAgreed: "개인정보 처리에 동의해 주세요." };
  context.mock.method(globalThis, "fetch", async () => Response.json({
    success: false, data: null, error: { code: "VALIDATION_ERROR", message: "입력값을 확인해 주세요.", fields: errors },
  }, { status: 400 }));
  await assert.rejects(signupWithGoogle(fields), (failure) => {
    assert.equal(failure.status, 400);
    assert.equal(failure.isValidationError, true);
    assert.deepEqual(failure.fields, errors);
    return true;
  });
});
