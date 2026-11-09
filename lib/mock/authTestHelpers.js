import { createMockAuthFetch } from "./auth.js";

export function createMockBrowser({ storage, origin = "https://preview.test", registered = false, ...options } = {}) {
  const values = new Map();
  const localStorage = storage ?? {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  // 기존 회원으로 시작하는 시나리오는 테스트에서만 초기 데이터를 준비한다.
  if (!storage && registered) localStorage.setItem("sajarok_mock_auth", JSON.stringify({
    version: 1, session: null, signup: null,
    account: { googleSub: null, user: {
      id: 1, email: "lion.cau@gmail.com", name: "김사자", studentNo: "20231234",
      department: "소프트웨어학부", cohort: 14, part: "PLAN_DESIGN",
    } },
  }));
  const fetch = (url, init) => createMockAuthFetch({ storage: localStorage, ...options })(url, init);
  const send = (path, body, method = body === undefined ? "GET" : "POST") => fetch(`${origin}/api/v1/${path}`, {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }),
  });
  return { storage: localStorage, fetch, send };
}
