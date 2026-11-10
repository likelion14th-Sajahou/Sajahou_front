import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { createFileAttachment } from "./attachmentApi.js";
import { authRequest, clearCsrfToken, getCurrentUser, loginWithGoogle, logoutSession, signupWithGoogle } from "./auth.js";
import { createMockBrowser } from "./mock/authTestHelpers.js";
import { updateProfile, withdrawAccount } from "./profileApi.js";

// CSRF 토큰은 모듈에 보관되므로 테스트마다 비운다.
beforeEach(clearCsrfToken);

// 실제 백엔드처럼 응답하는 가짜 서버다. respond(url, method, headers)로 상태를 바꿀 수 있다.
function useLiveBackend(t, respond = () => null) {
  const env = { NEXT_PUBLIC_AUTH_MODE: "live", NEXT_PUBLIC_GOOGLE_AUTH_MODE: "google", NEXT_PUBLIC_API_BASE_URL: "https://backend.test" };
  for (const [key, value] of Object.entries(env)) {
    const previous = process.env[key];
    process.env[key] = value;
    t.after(() => { if (previous === undefined) delete process.env[key]; else process.env[key] = previous; });
  }
  const requests = [];
  let issued = 0;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    const path = String(url).replace("https://backend.test/api/v1", "");
    requests.push({ path, method: options.method, headers: options.headers, credentials: options.credentials });
    const custom = respond(path, options.method, options.headers);
    if (custom) return custom;
    if (path === "/auth/csrf") return Response.json({ success: true, data: { headerName: "X-CSRF-TOKEN", token: `token-${++issued}` }, error: null });
    return options.method === "DELETE" ? new Response(null, { status: 204 }) : Response.json({ success: true, data: { registered: true }, error: null });
  });
  return requests;
}

const signupValues = { signupToken: "signup", name: "김사자", studentNo: "20231234", department: "소프트웨어학부", cohort: 14, part: "FRONTEND", privacyAgreed: true };
const calls = (requests) => requests.map(({ path, method }) => `${method} ${path}`);
const csrfFailure = () => Response.json({ success: false, data: null, error: { code: "CSRF_INVALID", message: "CSRF" } }, { status: 403 });

test("GET이 아닌 모든 요청에 CSRF 헤더를 붙이고, 같은 세션에서는 받은 토큰을 다시 쓴다(이슈 #32)", async (t) => {
  const requests = useLiveBackend(t);
  await getCurrentUser();
  await loginWithGoogle("google-id-token");
  await signupWithGoogle(signupValues);
  await updateProfile({ name: "새사자" });
  await createFileAttachment(new File(["회의"], "회의.pdf"), "MEETING_NOTE");
  await withdrawAccount("google-id-token");

  assert.deepEqual(calls(requests), [
    "GET /users/me", "GET /auth/csrf", "POST /auth/google", "POST /auth/signup", "PATCH /users/me", "POST /attachments/files", "DELETE /users/me",
  ]);
  assert.ok(requests.every(({ credentials }) => credentials === "include"));
  assert.equal(new Headers(requests[0].headers).has("X-CSRF-TOKEN"), false);
  for (const request of requests.filter(({ method }) => method !== "GET")) {
    assert.equal(request.headers.get("X-CSRF-TOKEN"), "token-1");
    assert.equal(request.headers.has("Authorization"), false);
  }
});

test("로그아웃·탈퇴·401 뒤에는 토큰을 버리고 다음 요청에서 새로 받는다", async (t) => {
  let expired = false;
  const requests = useLiveBackend(t, (path) => (expired && path === "/users/me"
    ? Response.json({ success: false, data: null, error: { code: "UNAUTHORIZED", message: "만료" } }, { status: 401 }) : null));
  await loginWithGoogle("google-id-token");
  await logoutSession();
  await loginWithGoogle("google-id-token");
  expired = true;
  await assert.rejects(getCurrentUser(), { status: 401 });
  await signupWithGoogle(signupValues);

  assert.deepEqual(calls(requests), [
    "GET /auth/csrf", "POST /auth/google", "POST /auth/logout",
    "GET /auth/csrf", "POST /auth/google", "GET /users/me",
    "GET /auth/csrf", "POST /auth/signup",
  ]);
  assert.deepEqual(requests.filter(({ method }) => method === "POST").map(({ headers }) => headers.get("X-CSRF-TOKEN")), ["token-1", "token-1", "token-2", "token-3"]);
});

test("403이 오면 토큰을 새로 받아 딱 한 번만 다시 보낸다", async (t) => {
  let rejectFirst = true;
  let alwaysReject = false;
  const requests = useLiveBackend(t, (path, method, headers) => {
    if (method !== "POST") return null;
    if (alwaysReject || (rejectFirst && headers.get("X-CSRF-TOKEN") === "token-1")) {
      rejectFirst = false;
      return csrfFailure();
    }
    return null;
  });
  await loginWithGoogle("google-id-token");
  assert.deepEqual(calls(requests), ["GET /auth/csrf", "POST /auth/google", "GET /auth/csrf", "POST /auth/google"]);

  // 다시 보내도 403이면 더 보내지 않고 실패를 알린다.
  requests.length = 0;
  alwaysReject = true;
  await assert.rejects(logoutSession(), { status: 403, code: "CSRF_INVALID" });
  assert.deepEqual(calls(requests), ["POST /auth/logout", "GET /auth/csrf", "POST /auth/logout"]);
});

test("CSRF_INVALID가 아닌 403(권한 오류 등)은 다시 보내지 않는다", async (t) => {
  const requests = useLiveBackend(t, (path, method) => {
    if (method === "DELETE") return Response.json({ success: false, data: null, error: { code: "FORBIDDEN", message: "권한 없음" } }, { status: 403 });
    // 스프링 기본 형식의 403도 CSRF_INVALID가 아니라 다시 보내지 않는다.
    if (method === "PATCH") return Response.json({ timestamp: "2026-11-11T00:00:00", status: 403, error: "Forbidden", path }, { status: 403 });
    return null;
  });
  await assert.rejects(withdrawAccount("google-id-token"), { status: 403, code: "FORBIDDEN" });
  await assert.rejects(updateProfile({ name: "새사자" }), { status: 403 });
  assert.deepEqual(calls(requests), ["GET /auth/csrf", "DELETE /users/me", "PATCH /users/me"]);
});

test("동시에 보낸 요청도 토큰은 한 번만 받고, 응답이 비면 요청을 보내지 않는다", async (t) => {
  let empty = false;
  const requests = useLiveBackend(t, (path) => (empty && path === "/auth/csrf"
    ? Response.json({ success: true, data: { headerName: "", token: null }, error: null }) : null));
  await Promise.all([updateProfile({ name: "가" }), updateProfile({ name: "나" }), authRequest("/projects", { method: "POST", body: {} })]);
  assert.equal(calls(requests).filter((call) => call === "GET /auth/csrf").length, 1);

  clearCsrfToken();
  requests.length = 0;
  empty = true;
  await assert.rejects(logoutSession(), /보안 확인 정보/);
  assert.deepEqual(calls(requests), ["GET /auth/csrf"]);
});

test("mock은 GET이 아닌 요청에 토큰이 없거나 틀리면 403 CSRF_INVALID이고, 로그아웃하면 토큰이 바뀐다", async () => {
  const browser = createMockBrowser({ registered: true });
  const body = { idToken: "mock-google-id-token" };
  const rejected = await browser.send("auth/google", body, "POST", { csrf: false });
  assert.equal(rejected.status, 403);
  assert.equal((await rejected.json()).error.code, "CSRF_INVALID");

  const { data: csrf } = await (await browser.send("auth/csrf")).json();
  const post = (path, token, payload = {}) => browser.fetch(`https://preview.test/api/v1/${path}`, {
    method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json", [csrf.headerName]: token },
  });
  assert.equal((await post("auth/google", "wrong-token", body)).status, 403);
  assert.equal((await post("auth/google", csrf.token, body)).status, 200);
  // 같은 세션에서는 같은 토큰을 다시 쓸 수 있다.
  assert.equal((await post("auth/logout", csrf.token)).status, 200);
  assert.equal((await post("auth/google", csrf.token, body)).status, 403);
  assert.equal((await browser.send("auth/google", body)).status, 200);
});
