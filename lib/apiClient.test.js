import assert from "node:assert/strict";
import { test } from "node:test";
import nextConfig from "../next.config.mjs";
import { apiRequest } from "./apiClient.js";
import { clearCsrfToken, getCurrentUser, loginDemo } from "./auth.js";

function setEnv(t, key, value) {
  const previous = process.env[key];
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
  t.after(() => {
    if (previous === undefined) delete process.env[key];
    else process.env[key] = previous;
  });
}

function useBrowser(t, origin) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { location: { origin } } });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else delete globalThis.window;
  });
}

test("rewrite는 개발 서버 기본값과 끝 슬래시가 있는 BACKEND_URL을 지원한다", async (t) => {
  setEnv(t, "BACKEND_URL", undefined);
  assert.deepEqual(await nextConfig.rewrites(), [{
    source: "/api/v1/:path*", destination: "https://13-209-185-170.sslip.io/api/v1/:path*",
  }]);
  process.env.BACKEND_URL = "https://other-backend.test///";
  assert.deepEqual(await nextConfig.rewrites(), [{
    source: "/api/v1/:path*", destination: "https://other-backend.test/api/v1/:path*",
  }]);
});

for (const origin of ["http://localhost:3000", "https://preview.test", "https://sajarok.test"]) {
  test(`${origin} 브라우저는 기존 백엔드 환경변수 대신 현재 origin으로 쿼리와 쿠키를 보낸다`, async (t) => {
    useBrowser(t, origin);
    setEnv(t, "NEXT_PUBLIC_API_BASE_URL", "https://legacy-backend.test");
    const fetcher = async (url, options) => {
      assert.equal(url.origin, origin);
      assert.equal(url.pathname, "/api/v1/story-cards");
      assert.deepEqual([...url.searchParams], [["q", "협업 & 기록"], ["id", "1"], ["id", "2"], ["page", "0"]]);
      assert.equal(options.credentials, "include");
      return Response.json({ success: true, data: [], error: null });
    };
    assert.deepEqual(await apiRequest("/story-cards", {
      query: { q: "협업 & 기록", id: [1, 2], page: 0, ignored: null }, fetcher,
    }), []);
  });
}

test("공개 API 주소 없이 live 로그인·CSRF·내 정보 조회 모두 프론트 origin을 사용한다", async (t) => {
  useBrowser(t, "https://preview.test");
  setEnv(t, "NEXT_PUBLIC_API_BASE_URL", undefined);
  setEnv(t, "NEXT_PUBLIC_AUTH_MODE", "live");
  clearCsrfToken();
  t.after(clearCsrfToken);
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    requests.push(url.pathname);
    assert.equal(url.origin, "https://preview.test");
    assert.equal(options.credentials, "include");
    if (url.pathname.endsWith("/auth/csrf")) {
      return Response.json({ success: true, data: { headerName: "X-CSRF-TOKEN", token: "token" }, error: null });
    }
    if (url.pathname.endsWith("/auth/demo")) {
      assert.equal(options.method, "POST");
      assert.equal(options.headers.get("X-CSRF-TOKEN"), "token");
    }
    return Response.json({ success: true, data: { id: 1 }, error: null });
  });
  await loginDemo();
  assert.deepEqual(await getCurrentUser(), { id: 1 });
  assert.deepEqual(requests, ["/api/v1/auth/csrf", "/api/v1/auth/demo", "/api/v1/users/me"]);
});

test("명시적 baseUrl은 브라우저 기본값보다 우선하며 /api/v1을 중복하지 않는다", async (t) => {
  useBrowser(t, "https://preview.test");
  await apiRequest("/users/me", {
    baseUrl: "https://explicit.test/api/v1/",
    fetcher: async (url) => {
      assert.equal(String(url), "https://explicit.test/api/v1/users/me");
      return Response.json({ success: true, data: null, error: null });
    },
  });
});

test("mock 데모 로그인은 공개 API 주소 없이 동작하고 실제 fetch를 호출하지 않는다", async (t) => {
  useBrowser(t, "http://localhost:3000");
  setEnv(t, "NEXT_PUBLIC_API_BASE_URL", undefined);
  setEnv(t, "NEXT_PUBLIC_AUTH_MODE", "mock");
  const values = new Map();
  window.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  clearCsrfToken();
  t.after(clearCsrfToken);
  const network = t.mock.method(globalThis, "fetch", () => {
    throw new Error("mock 모드에서 네트워크 요청이 발생했습니다.");
  });
  await loginDemo();
  assert.equal((await getCurrentUser()).isDemo, true);
  assert.equal(network.mock.callCount(), 0);
});

test("서버는 명시적 절대 URL을 사용하고 주소가 없으면 요청 전에 실패한다", async (t) => {
  setEnv(t, "NEXT_PUBLIC_API_BASE_URL", undefined);
  let requests = 0;
  const fetcher = async (url) => {
    requests += 1;
    assert.equal(String(url), "https://backend.test/api/v1/users/me");
    return Response.json({ success: true, data: null, error: null });
  };
  await assert.rejects(apiRequest("/users/me", { fetcher }), /baseUrl/);
  assert.equal(requests, 0);
  await apiRequest("/users/me", { baseUrl: "https://backend.test", fetcher });
  assert.equal(requests, 1);
});
