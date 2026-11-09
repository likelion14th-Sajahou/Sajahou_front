import assert from "node:assert/strict";
import test from "node:test";
import { getCurrentUser } from "./auth.js";
import { ApiError } from "./apiClient.js";
import { updateProfile, withdrawAccount } from "./profileApi.js";
import { createMockAuthHandler } from "./mock/auth.js";

test("mock 설정의 공통 Client로 조회·부분 수정·검증 오류·탈퇴 204를 처리한다", async (t) => {
  const previousMode = process.env.NEXT_PUBLIC_AUTH_MODE;
  process.env.NEXT_PUBLIC_AUTH_MODE = "mock";
  t.after(() => {
    if (previousMode === undefined) delete process.env.NEXT_PUBLIC_AUTH_MODE;
    else process.env.NEXT_PUBLIC_AUTH_MODE = previousMode;
  });
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { location: { origin: "http://mock.test" } } });
  t.after(() => {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else delete globalThis.window;
  });
  const handle = createMockAuthHandler({ registered: true });
  const login = await handle(new Request("http://mock.test/api/v1/auth/google", {
    method: "POST", body: JSON.stringify({ idToken: "mock-google-id-token" }),
  }), "auth/google");
  const cookie = login.headers.get("Set-Cookie").split(";")[0];
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url: String(url), ...options });
    const headers = new Headers(options.headers);
    headers.set("Cookie", cookie);
    return handle(new Request(url, { ...options, headers }), new URL(url).pathname.slice("/api/v1/".length));
  });

  const initial = await getCurrentUser();
  const updated = await updateProfile({ name: "변경한 이름", email: "ignored", part: "BACKEND", cohort: undefined });
  assert.deepEqual(updated, { ...initial, name: "변경한 이름" });
  assert.deepEqual(JSON.parse(calls[1].body), { name: "변경한 이름" });
  assert.equal(calls[1].url, "http://mock.test/api/v1/users/me");
  assert.equal(calls[1].method, "PATCH");
  assert.equal(calls[1].credentials, "include");
  assert.equal(calls[1].headers.has("Authorization"), false);
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
  assert.equal(calls.at(-1).method, "DELETE");
  assert.deepEqual(JSON.parse(calls.at(-1).body), { idToken: "mock-google-id-token" });
  await assert.rejects(getCurrentUser(), { status: 401 });
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
  controller.abort();
  assert.equal(requests[0].signal.aborted, true);
  assert.equal(await withdrawAccount("google-id-token"), undefined);
  assert.deepEqual(JSON.parse(requests[1].body), { idToken: "google-id-token" });
  const count = requests.length;
  assert.throws(() => withdrawAccount(" "), /본인 확인/);
  assert.equal(requests.length, count);
});
