import assert from "node:assert/strict";
import test from "node:test";
import { createMockBrowser } from "./authTestHelpers.js";
import { createMockAuthFetch } from "./auth.js";

const validFields = {
  name: "새사자", studentNo: "20231234", department: "직접 입력 학과",
  cohort: 13, part: "FRONTEND", privacyAgreed: true,
};
const idToken = "mock-google-id-token";
async function beginSignup(browser, token = idToken) {
  const response = await browser.send("auth/google", { idToken: token });
  assert.equal(response.status, 200);
  const { data } = await response.json();
  assert.equal(data.registered, false);
  return data;
}
function googleToken(sub, { exp = Math.floor(Date.now() / 1000) + 3600, nonce = "first" } = {}) {
  return `header.${Buffer.from(JSON.stringify({ sub, exp, nonce, email: `${sub}@gmail.com`, name: "Google 사자" })).toString("base64url")}.signature`;
}

test("새 호출에서도 localStorage로 가입·조회·로그아웃·재로그인을 이어가고 가입 토큰을 소비한다", async () => {
  const browser = createMockBrowser();
  const { signupToken, email } = await beginSignup(browser);
  assert.equal(email, "lion.cau@gmail.com");
  const signup = await browser.send("auth/signup", { ...validFields, signupToken });
  assert.equal(signup.status, 201);
  assert.equal((await signup.json()).data.accessToken, undefined);
  let me = await browser.send("users/me");
  const user = (await me.json()).data;
  for (const key of ["name", "studentNo", "department", "cohort", "part"]) assert.equal(user[key], validFields[key]);
  assert.equal((await browser.send("auth/signup", { ...validFields, signupToken })).status, 401);
  assert.equal((await browser.send("auth/logout", {})).status, 200);
  assert.equal((await browser.send("users/me")).status, 401);
  const login = await browser.send("auth/google", { idToken });
  assert.equal((await login.json()).data.registered, true);
  me = await browser.send("users/me");
  assert.deepEqual((await me.json()).data, user);
});

test("부분 수정과 읽기 전용 필드는 같은 저장소의 새 탭·재로그인에서 유지된다", async () => {
  const browser = createMockBrowser({ registered: true });
  await browser.send("auth/google", { idToken });
  const before = (await (await browser.send("users/me")).json()).data;
  const updated = await browser.send("users/me", { name: " 새사자 ", department: " 기타 학과 ", email: "ignored", part: "BACKEND", id: 99 }, "PATCH");
  assert.equal(updated.status, 200);
  const expected = { ...before, name: "새사자", department: "기타 학과" };
  assert.deepEqual((await updated.json()).data, expected);
  const newTab = createMockBrowser({ storage: browser.storage });
  assert.deepEqual((await (await newTab.send("users/me")).json()).data, expected);
  await browser.send("auth/logout", {});
  await browser.send("auth/google", { idToken });
  assert.deepEqual((await (await browser.send("users/me")).json()).data, expected);
});

test("별도 브라우저의 가입·수정·탈퇴 상태는 서로 영향을 주지 않는다", async () => {
  const first = createMockBrowser({ registered: true });
  const second = createMockBrowser({ registered: true });
  await first.send("auth/google", { idToken });
  await second.send("auth/google", { idToken });
  await first.send("users/me", { name: "첫 브라우저" }, "PATCH");
  assert.equal((await (await second.send("users/me")).json()).data.name, "김사자");
  assert.equal((await first.send("users/me", { idToken }, "DELETE")).status, 204);
  assert.equal((await second.send("users/me")).status, 200);
});

test("가입 입력 오류를 한 번에 반환하고 같은 가입 정보로 수정 후 가입할 수 있다", async () => {
  const browser = createMockBrowser();
  const { signupToken } = await beginSignup(browser);
  const response = await browser.send("auth/signup", { ...validFields, signupToken, name: "가".repeat(51), studentNo: "123", department: " ", cohort: "14", part: "frontend", privacyAgreed: false });
  assert.equal(response.status, 400);
  const result = await response.json();
  assert.equal(result.error.code, "VALIDATION_ERROR");
  assert.deepEqual(Object.keys(result.error.fields), ["name", "studentNo", "department", "cohort", "part", "privacyAgreed"]);
  assert.equal((await browser.send("auth/signup", { ...validFields, signupToken })).status, 201);
});

test("부분 수정은 보낸 필드만 검증하고 오류·잘못된 본문에는 기존 사용자 정보를 유지한다", async () => {
  const browser = createMockBrowser({ registered: true });
  await browser.send("auth/google", { idToken });
  const response = await browser.send("users/me", { name: "가".repeat(51), studentNo: "123", department: " ", cohort: "14" }, "PATCH");
  assert.equal(response.status, 400);
  assert.deepEqual(Object.keys((await response.json()).error.fields), ["name", "studentNo", "department", "cohort"]);
  assert.equal((await (await browser.send("users/me", {}, "PATCH")).json()).data.name, "김사자");
  const valid = await browser.send("users/me", { studentNo: "00123456", cohort: 12 }, "PATCH");
  assert.equal((await valid.json()).data.studentNo, "00123456");
  for (const body of [null, [], "text"]) assert.equal((await browser.send("users/me", body, "PATCH")).status, 400);
});

test("가입 상태·토큰은 브라우저가 다르거나 만료되면 사용할 수 없다", async () => {
  let clock = 1000;
  const browser = createMockBrowser({ now: () => clock });
  const other = createMockBrowser({ now: () => clock });
  const { signupToken } = await beginSignup(browser);
  assert.equal((await other.send("auth/signup", { ...validFields, signupToken })).status, 401);
  clock += 10 * 60 * 1000;
  for (const token of [signupToken, "unknown", undefined]) assert.equal((await browser.send("auth/signup", { ...validFields, signupToken: token })).status, 401);
});

test("조회·수정·탈퇴는 세션이 없거나 정확히 7일이 지나면 401이다", async () => {
  for (const method of ["GET", "PATCH", "DELETE"]) {
    let clock = 1000;
    const browser = createMockBrowser({ registered: true, now: () => clock });
    assert.equal((await browser.send("users/me", method === "GET" ? undefined : {}, method)).status, 401);
    await browser.send("auth/google", { idToken });
    clock += 7 * 24 * 60 * 60 * 1000;
    assert.equal((await browser.send("users/me", method === "GET" ? undefined : {}, method)).status, 401);
  }
});

test("같은 Google 계정의 새 토큰으로 탈퇴하고 다른 계정·만료 토큰은 세션을 유지하며 거부한다", async () => {
  const browser = createMockBrowser();
  const { signupToken, email, suggestedName } = await beginSignup(browser, googleToken("google-user"));
  assert.equal(email, "google-user@gmail.com");
  assert.equal(suggestedName, "Google 사자");
  assert.equal((await browser.send("auth/signup", { ...validFields, signupToken })).status, 201);
  for (const token of ["invalid", "mock-expired-google-token", "mock-other-google-id-token", googleToken("other"), googleToken("google-user", { exp: 1 })]) {
    assert.equal((await browser.send("users/me", { idToken: token }, "DELETE")).status, 401);
    assert.equal((await browser.send("users/me")).status, 200);
  }
  const response = await browser.send("users/me", { idToken: googleToken("google-user", { nonce: "new" }) }, "DELETE");
  assert.equal(response.status, 204);
  assert.equal(await response.text(), "");
  assert.equal((await browser.send("users/me")).status, 401);
});

test("기존 회원도 탈퇴 후에는 같은 브라우저에서 신규 가입한다", async () => {
  const browser = createMockBrowser({ registered: true });
  await browser.send("auth/google", { idToken });
  assert.equal((await browser.send("users/me", { idToken }, "DELETE")).status, 204);
  await beginSignup(browser);
});

test("데모는 조회·로그아웃할 수 있지만 탈퇴는 거부된다", async () => {
  const browser = createMockBrowser();
  assert.equal((await browser.send("auth/demo", {})).status, 200);
  assert.equal((await (await browser.send("users/me")).json()).data.id, 2);
  assert.equal((await browser.send("users/me", { idToken }, "DELETE")).status, 401);
  await browser.send("auth/logout", {});
  assert.equal((await browser.send("users/me")).status, 401);
});

test("mock 저장소에 Google ID 토큰을 보관하지 않고 취소된 요청은 상태를 바꾸지 않는다", async () => {
  const browser = createMockBrowser({ registered: true });
  const token = googleToken("real-google-user");
  await browser.send("auth/google", { idToken: token });
  const stored = browser.storage.getItem("sajarok_mock_auth");
  assert.ok(!stored.includes(token));
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(browser.fetch("https://preview.test/api/v1/users/me", { method: "DELETE", signal: controller.signal, body: JSON.stringify({ idToken: token }) }), { name: "AbortError" });
  assert.equal(browser.storage.getItem("sajarok_mock_auth"), stored);
});

test("손상된 개발 데이터는 초기화하고 저장소 차단은 명세 형식의 오류로 전달한다", async () => {
  const browser = createMockBrowser();
  browser.storage.setItem("sajarok_mock_auth", "invalid json");
  assert.equal((await browser.send("users/me")).status, 401);
  const fetch = createMockAuthFetch({ storage: { getItem() { throw new Error("blocked"); } } });
  const response = await fetch("https://preview.test/api/v1/users/me");
  assert.equal(response.status, 503);
  const payload = await response.json();
  assert.equal(payload.success, false);
  assert.equal(payload.data, null);
  assert.equal(payload.error.code, "INTERNAL_ERROR");
});
