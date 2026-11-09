import assert from "node:assert/strict";
import test from "node:test";
import { createMockAuthHandler } from "./auth.js";

function request(path, body, cookie, method = body === undefined ? "GET" : "POST") {
  return new Request(`http://localhost/api/v1/${path}`, {
    method,
    headers: { ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...(cookie ? { Cookie: cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

const validFields = {
  name: "새사자", studentNo: "20231234", department: "직접 입력 학과",
  cohort: 13, part: "FRONTEND", privacyAgreed: true,
};

async function beginSignup(handle) {
  const response = await handle(request("auth/google", { idToken: "mock-google-id-token" }), "auth/google");
  const { data } = await response.json();
  assert.equal(data.registered, false);
  assert.equal(data.email, "lion.cau@gmail.com");
  return data.signupToken;
}

test("가입 성공은 201과 HttpOnly 세션을 발급하고 사용자 조회와 재로그인에 입력값을 반영한다", async () => {
  const handle = createMockAuthHandler();
  const signupToken = await beginSignup(handle);
  const response = await handle(request("auth/signup", { ...validFields, signupToken }), "auth/signup");
  assert.equal(response.status, 201);
  assert.match(response.headers.get("Set-Cookie"), /HttpOnly; SameSite=Lax/);
  const result = await response.json();
  assert.equal(result.data.user.name, validFields.name);
  assert.equal(result.data.user.part, validFields.part);
  assert.equal(result.data.accessToken, undefined);
  const cookie = response.headers.get("Set-Cookie").split(";")[0];
  const me = await handle(request("users/me", undefined, cookie), "users/me");
  assert.equal(me.status, 200);
  const { data: user } = await me.json();
  for (const key of ["name", "studentNo", "department", "cohort", "part"]) assert.equal(user[key], validFields[key]);
  const login = await handle(request("auth/google", { idToken: "mock-google-id-token" }), "auth/google");
  assert.equal((await login.json()).data.registered, true);
  const reused = await handle(request("auth/signup", { ...validFields, signupToken }), "auth/signup");
  assert.equal(reused.status, 401);
});

async function loginCookie(handle, path = "auth/google") {
  const response = await handle(request(path, { idToken: "mock-google-id-token" }), path);
  assert.equal(response.status, 200);
  return response.headers.get("Set-Cookie").split(";")[0];
}

test("부분 수정은 읽기 전용 필드를 유지하고 다른 세션·재로그인·조회에 반영된다", async () => {
  const handle = createMockAuthHandler({ registered: true });
  const cookie = await loginCookie(handle);
  const otherCookie = await loginCookie(handle);
  const before = (await (await handle(request("users/me", undefined, cookie), "users/me")).json()).data;
  const response = await handle(request("users/me", { name: " 새사자 ", department: " 기타 학과 ",
    email: "changed@example.com", part: "BACKEND", id: 99 }, cookie, "PATCH"), "users/me");
  assert.equal(response.status, 200);
  const expected = { ...before, name: "새사자", department: "기타 학과" };
  assert.deepEqual(await response.json(), { success: true, data: expected, error: null });
  for (const token of [cookie, otherCookie, await loginCookie(handle)]) {
    const me = await handle(request("users/me", undefined, token), "users/me");
    assert.deepEqual((await me.json()).data, expected);
  }
});

test("부분 수정 검증은 전달한 필드에만 적용하고 실패 시 사용자 정보를 유지한다", async () => {
  const handle = createMockAuthHandler({ registered: true });
  const cookie = await loginCookie(handle);
  const invalid = await handle(request("users/me", { name: "가".repeat(51), studentNo: "123", department: " ", cohort: "14" }, cookie, "PATCH"), "users/me");
  assert.equal(invalid.status, 400);
  assert.deepEqual(Object.keys((await invalid.json()).error.fields), ["name", "studentNo", "department", "cohort"]);
  const unchanged = await handle(request("users/me", {}, cookie, "PATCH"), "users/me");
  assert.equal((await unchanged.json()).data.name, "김사자");
  const valid = await handle(request("users/me", { studentNo: "00123456", cohort: 12 }, cookie, "PATCH"), "users/me");
  assert.equal(valid.status, 200);
  assert.equal((await valid.json()).data.studentNo, "00123456");
  for (const body of [null, [], "text"]) {
    assert.equal((await handle(request("users/me", body, cookie, "PATCH"), "users/me")).status, 400);
  }
});

test("조회·수정·탈퇴는 없는 세션과 정확히 만료된 세션에 401을 반환한다", async () => {
  let clock = 1000;
  const handle = createMockAuthHandler({ registered: true, now: () => clock });
  const cookie = await loginCookie(handle);
  clock += 7 * 24 * 60 * 60 * 1000;
  for (const method of ["GET", "PATCH", "DELETE"]) {
    for (const token of [undefined, cookie]) {
      const response = await handle(request("users/me", method === "GET" ? undefined : {}, token, method), "users/me");
      assert.equal(response.status, 401);
      assert.equal((await response.json()).error.code, "UNAUTHORIZED");
    }
  }
});

test("재인증 실패와 데모 탈퇴는 401이며 기존 세션과 계정은 유지된다", async () => {
  const handle = createMockAuthHandler({ registered: true });
  const cookie = await loginCookie(handle);
  for (const idToken of [undefined, "", "mock-expired-google-token", "mock-other-google-id-token", "invalid"]) {
    const response = await handle(request("users/me", { idToken }, cookie, "DELETE"), "users/me");
    assert.equal(response.status, 401);
    assert.equal((await response.json()).error.code, "UNAUTHORIZED");
    assert.equal(response.headers.get("Set-Cookie"), null);
    assert.equal((await handle(request("users/me", undefined, cookie), "users/me")).status, 200);
  }
  const demoCookie = await loginCookie(handle, "auth/demo");
  const demoDelete = await handle(request("users/me", { idToken: "mock-google-id-token" }, demoCookie, "DELETE"), "users/me");
  assert.equal(demoDelete.status, 401);
  assert.equal((await handle(request("users/me", undefined, demoCookie), "users/me")).status, 200);
});

test("탈퇴 성공은 본문 없는 204·쿠키 만료이며 모든 회원 세션을 무효화하고 데모는 유지한다", async () => {
  const handle = createMockAuthHandler({ registered: true });
  const cookies = [await loginCookie(handle), await loginCookie(handle)];
  const demoCookie = await loginCookie(handle, "auth/demo");
  const response = await handle(request("users/me", { idToken: "mock-google-id-token" }, cookies[0], "DELETE"), "users/me");
  assert.equal(response.status, 204);
  assert.equal(await response.text(), "");
  assert.match(response.headers.get("Set-Cookie"), /Max-Age=0/);
  for (const cookie of cookies) assert.equal((await handle(request("users/me", undefined, cookie), "users/me")).status, 401);
  assert.equal((await handle(request("users/me", undefined, demoCookie), "users/me")).status, 200);
  // 탈퇴 후 같은 Google 계정으로 들어오면 기존 회원이 아니라 가입 흐름으로 진입한다.
  await beginSignup(handle);
});

test("입력 오류를 fields에 한 번에 반환하고 같은 토큰으로 수정 후 가입할 수 있다", async () => {
  const handle = createMockAuthHandler();
  const signupToken = await beginSignup(handle);
  const response = await handle(request("auth/signup", { ...validFields, signupToken, studentNo: "123", privacyAgreed: false }), "auth/signup");
  assert.equal(response.status, 400);
  assert.deepEqual((await response.json()).error, {
    code: "VALIDATION_ERROR", message: "입력값을 확인해 주세요.",
    fields: { studentNo: "학번은 숫자 8자리로 입력해 주세요.", privacyAgreed: "개인정보 처리에 동의해 주세요." },
  });
  assert.equal((await handle(request("auth/signup", { ...validFields, signupToken }), "auth/signup")).status, 201);
});

test("이름 길이·학과 공백·기수·파트를 검증한다", async () => {
  const handle = createMockAuthHandler();
  const signupToken = await beginSignup(handle);
  const response = await handle(request("auth/signup", { ...validFields, signupToken,
    name: "가".repeat(51), department: "  ", cohort: "14", part: "frontend" }), "auth/signup");
  assert.equal(response.status, 400);
  assert.deepEqual(Object.keys((await response.json()).error.fields), ["name", "department", "cohort", "part"]);
  const valid = await handle(request("auth/signup", { ...validFields, signupToken, name: "가".repeat(50) }), "auth/signup");
  assert.equal(valid.status, 201);
});

test("발급 후 정확히 10분이 지난 가입 토큰과 없는 토큰은 401이다", async () => {
  let clock = 1000;
  const handle = createMockAuthHandler({ now: () => clock });
  const signupToken = await beginSignup(handle);
  clock += 10 * 60 * 1000;
  for (const token of [signupToken, "unknown", undefined]) {
    const response = await handle(request("auth/signup", { ...validFields, signupToken: token }), "auth/signup");
    assert.equal(response.status, 401);
    assert.equal((await response.json()).error.code, "UNAUTHORIZED");
  }
});

test("기존 회원·데모 세션은 조회 가능하고 로그아웃 성공 후에는 401이다", async () => {
  for (const path of ["auth/google", "auth/demo"]) {
    const handle = createMockAuthHandler({ registered: true });
    const login = await handle(request(path, { idToken: "mock-google-id-token" }), path);
    assert.equal(login.status, 200);
    const cookie = login.headers.get("Set-Cookie").split(";")[0];
    assert.equal((await handle(request("users/me", undefined, cookie), "users/me")).status, 200);
    const logout = await handle(request("auth/logout", {}, cookie), "auth/logout");
    assert.equal(logout.status, 200);
    assert.match(logout.headers.get("Set-Cookie"), /Max-Age=0/);
    assert.equal((await handle(request("users/me", undefined, cookie), "users/me")).status, 401);
  }
});
