import assert from "node:assert/strict";
import test from "node:test";
import { loginWithGoogle, logoutSession, signupWithGoogle } from "./auth.js";
import { createMockBrowser } from "./mock/authTestHelpers.js";

function useLiveBackend(t, csrf = { headerName: "X-XSRF-TOKEN", token: "server-token" }) {
  const env = { NEXT_PUBLIC_AUTH_MODE: "live", NEXT_PUBLIC_GOOGLE_AUTH_MODE: "google", NEXT_PUBLIC_API_BASE_URL: "https://backend.test" };
  for (const [key, value] of Object.entries(env)) {
    const previous = process.env[key];
    process.env[key] = value;
    t.after(() => { if (previous === undefined) delete process.env[key]; else process.env[key] = previous; });
  }
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    requests.push({ url: String(url), method: options.method, headers: options.headers, credentials: options.credentials });
    return Response.json({ success: true, data: String(url).endsWith("/auth/csrf") ? csrf : { registered: true }, error: null });
  });
  return requests;
}

test("로그인·가입·로그아웃은 CSRF 토큰을 먼저 받아 응답의 헤더 이름으로 보내고, 두 요청 모두 쿠키를 함께 보낸다(이슈 #32)", async (t) => {
  const requests = useLiveBackend(t);
  await loginWithGoogle("google-id-token");
  await signupWithGoogle({ signupToken: "signup", name: "김사자", studentNo: "20231234", department: "소프트웨어학부", cohort: 14, part: "FRONTEND", privacyAgreed: true });
  await logoutSession();

  assert.deepEqual(requests.map(({ url, method }) => [url.replace("https://backend.test/api/v1", ""), method]), [
    ["/auth/csrf", "GET"], ["/auth/google", "POST"],
    ["/auth/csrf", "GET"], ["/auth/signup", "POST"],
    ["/auth/csrf", "GET"], ["/auth/logout", "POST"],
  ]);
  assert.ok(requests.every(({ credentials }) => credentials === "include"));
  for (const post of requests.filter(({ method }) => method === "POST")) {
    assert.equal(post.headers.get("X-XSRF-TOKEN"), "server-token");
    assert.equal(post.headers.has("Authorization"), false);
  }
});

test("CSRF 응답에 헤더 이름이나 토큰이 없으면 POST를 보내지 않는다", async (t) => {
  const requests = useLiveBackend(t, { headerName: "", token: null });
  await assert.rejects(logoutSession(), /보안 확인 정보/);
  assert.deepEqual(requests.map(({ method }) => method), ["GET"]);
});

test("mock은 CSRF 토큰이 없거나 틀리면 403이고, 한 번 쓴 토큰은 다시 쓸 수 없다", async () => {
  const browser = createMockBrowser({ registered: true });
  const body = { idToken: "mock-google-id-token" };
  assert.equal((await browser.send("auth/google", body, "POST", { csrf: false })).status, 403);

  const { data: csrf } = await (await browser.send("auth/csrf")).json();
  const post = (token) => browser.fetch("https://preview.test/api/v1/auth/google", {
    method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json", [csrf.headerName]: token },
  });
  assert.equal((await post("wrong-token")).status, 403);
  assert.equal((await post(csrf.token)).status, 200);
  assert.equal((await post(csrf.token)).status, 403);
  assert.equal((await browser.send("auth/google", body)).status, 200);
});
