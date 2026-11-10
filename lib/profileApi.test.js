import assert from "node:assert/strict";
import test from "node:test";
import { getCurrentUser } from "./auth.js";
import { ApiError } from "./apiClient.js";
import { checkWithdrawalSession, updateProfile, withdrawAccount } from "./profileApi.js";
import { createMockBrowser } from "./mock/authTestHelpers.js";

test("mock은 네트워크 없이 localStorage에서 처리하고 공통 Client의 응답·오류 처리를 재사용한다", async (t) => {
  const previousMode = process.env.NEXT_PUBLIC_AUTH_MODE;
  process.env.NEXT_PUBLIC_AUTH_MODE = "mock";
  t.after(() => {
    if (previousMode === undefined) delete process.env.NEXT_PUBLIC_AUTH_MODE;
    else process.env.NEXT_PUBLIC_AUTH_MODE = previousMode;
  });
  const browser = createMockBrowser({ registered: true, origin: "http://mock.test" });
  await browser.send("auth/google", { idToken: "mock-google-id-token" });
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { location: { origin: "http://mock.test" }, localStorage: browser.storage } });
  t.after(() => {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else delete globalThis.window;
  });
  const network = t.mock.method(globalThis, "fetch", () => {
    throw new Error("mock 모드에서 실제 네트워크를 호출하면 안 됩니다.");
  });

  const initial = await getCurrentUser();
  const updated = await updateProfile({ name: "변경한 이름", email: "ignored", part: "BACKEND", cohort: undefined });
  assert.deepEqual(updated, { ...initial, name: "변경한 이름" });
  await assert.rejects(updateProfile({ studentNo: "123" }), (error) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 400);
    assert.equal(error.isValidationError, true);
    assert.ok(error.fields.studentNo);
    return true;
  });
  await assert.rejects(withdrawAccount("mock-other-google-id-token"), { status: 401, code: "UNAUTHORIZED" });
  assert.equal((await getCurrentUser()).name, updated.name);
  assert.equal(await withdrawAccount("mock-google-id-token"), undefined);
  await assert.rejects(getCurrentUser(), { status: 401 });
  assert.equal(network.mock.callCount(), 0);
});

test("live 설정은 백엔드 주소·쿠키·JSON 본문을 사용하고 취소 signal을 전달한다", async (t) => {
  const env = { NEXT_PUBLIC_AUTH_MODE: "live", NEXT_PUBLIC_API_BASE_URL: "https://backend.test/api/v1" };
  for (const [key, value] of Object.entries(env)) {
    const previous = process.env[key];
    process.env[key] = value;
    t.after(() => { if (previous === undefined) delete process.env[key]; else process.env[key] = previous; });
  }
  const controller = new AbortController();
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    // PATCH·DELETE 전에 CSRF 토큰을 받는다(이슈 #32).
    if (String(url).endsWith("/auth/csrf")) return Response.json({ success: true, data: { headerName: "X-CSRF-TOKEN", token: "csrf-token" }, error: null });
    requests.push({ url: String(url), ...options });
    return options.method === "DELETE" ? new Response(null, { status: 204 })
      : Response.json({ success: true, data: { name: "서버 응답" }, error: null });
  });
  assert.deepEqual(await updateProfile({ department: "직접 입력 학과", cohort: 13 }, { signal: controller.signal }), { name: "서버 응답" });
  assert.equal(requests[0].url, "https://backend.test/api/v1/users/me");
  assert.equal(requests[0].credentials, "include");
  assert.equal(requests[0].cache, "no-store");
  assert.equal(requests[0].headers.get("Content-Type"), "application/json");
  assert.deepEqual(JSON.parse(requests[0].body), { department: "직접 입력 학과", cohort: 13 });
  assert.equal(requests[0].headers.get("X-CSRF-TOKEN"), "csrf-token");
  controller.abort();
  assert.equal(requests[0].signal.aborted, true);
  assert.equal(await withdrawAccount("google-id-token"), undefined);
  assert.deepEqual(JSON.parse(requests[1].body), { idToken: "google-id-token" });
  assert.equal(requests[1].headers.get("X-CSRF-TOKEN"), "csrf-token");
  const count = requests.length;
  assert.throws(() => withdrawAccount(" "), /본인 확인/);
  assert.equal(requests.length, count);
  t.mock.method(globalThis, "fetch", async () => { throw new TypeError("backend unavailable"); });
  await assert.rejects(updateProfile({ name: "실제 요청 실패" }), { kind: "network" });
});

test("탈퇴 후 세션 재확인은 200 사용자·401 만료·확인 불가를 구분한다", async (t) => {
  const env = { NEXT_PUBLIC_AUTH_MODE: "live", NEXT_PUBLIC_API_BASE_URL: "https://backend.test" };
  for (const [key, value] of Object.entries(env)) {
    const previous = process.env[key];
    process.env[key] = value;
    t.after(() => { if (previous === undefined) delete process.env[key]; else process.env[key] = previous; });
  }
  const user = { id: 1, name: "김사자", part: "PLAN_DESIGN" };
  let response = () => Response.json({ success: true, data: user, error: null });
  let requests = 0;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    requests += 1;
    assert.equal(String(url), "https://backend.test/api/v1/users/me");
    assert.equal(options.method, "GET");
    return response();
  });
  assert.deepEqual(await checkWithdrawalSession(), user);
  response = () => Response.json({ success: false, data: null, error: { code: "UNAUTHORIZED" } }, { status: 401 });
  assert.equal(await checkWithdrawalSession(), null);
  response = () => Response.json({ success: false, data: null, error: { code: "INTERNAL_ERROR" } }, { status: 500 });
  await assert.rejects(checkWithdrawalSession(), { status: 500 });
  response = () => { throw new TypeError("network failure"); };
  await assert.rejects(checkWithdrawalSession(), { kind: "network" });
  response = () => Response.json({ success: true, data: { name: "잘못된 사용자 응답" }, error: null });
  await assert.rejects(checkWithdrawalSession(), /사용자 정보를 확인/);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(checkWithdrawalSession({ signal: controller.signal }), { kind: "aborted" });
  assert.equal(requests, 5);
});
