import { AUTH_PART_LABELS } from "../authConfig.js";
import { failure, success } from "./mockResponse.js";

// 브라우저의 개발용 데이터만 보관한다. 실제 Google 토큰·백엔드 세션은 저장하지 않는다.
const STORAGE_KEY = "sajarok_mock_auth";
const SESSION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
const SIGNUP_LIFETIME_MS = 10 * 60 * 1000;
const MOCK_USER = {
  id: 1, email: "lion.cau@gmail.com", name: "김사자", studentNo: "20231234",
  department: "소프트웨어학부", cohort: 14, part: "PLAN_DESIGN",
};

// mock 전용: GIS가 반환한 JWT의 계정 정보를 읽어 로그인·탈퇴의 동일 계정을 비교한다.
// 서명을 검증하는 인증 구현이 아니며 live 요청은 이 핸들러를 사용하지 않는다.
function readMockGoogleIdentity(idToken, now) {
  if (idToken === "mock-google-id-token") return { sub: "mock-google-user", email: MOCK_USER.email, name: MOCK_USER.name };
  if (idToken === "mock-other-google-id-token") return { sub: "mock-other-user", email: "other@gmail.com", name: "다른 사자" };
  if (typeof idToken !== "string") return null;
  try {
    const parts = idToken.split(".");
    if (parts.length !== 3 || !parts.every(Boolean)) return null;
    const bytes = Uint8Array.from(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")), (char) => char.charCodeAt(0));
    const identity = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof identity?.sub !== "string" || !identity.sub || !Number.isFinite(identity.exp) || identity.exp * 1000 <= now) return null;
    return identity;
  } catch { return null; }
}

function validateBasicFields(body, partial = false) {
  const fields = {};
  if ((!partial || Object.hasOwn(body, "name")) &&
      (typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 50)) fields.name = "이름은 1~50자로 입력해 주세요.";
  if ((!partial || Object.hasOwn(body, "studentNo")) &&
      (typeof body.studentNo !== "string" || !/^\d{8}$/.test(body.studentNo))) fields.studentNo = "학번은 숫자 8자리로 입력해 주세요.";
  if ((!partial || Object.hasOwn(body, "department")) &&
      (typeof body.department !== "string" || !body.department.trim())) fields.department = "학과 이름을 입력해 주세요.";
  if ((!partial || Object.hasOwn(body, "cohort")) && ![12, 13, 14].includes(body.cohort)) fields.cohort = "기수를 골라 주세요.";
  return fields;
}

// 다른 도메인 mock이 로그인한 사용자를 확인할 때 쓴다. 로그인하지 않았거나 만료됐으면 null이다.
export function readMockSessionUser(storage, now = Date.now()) {
  try {
    const state = JSON.parse(storage.getItem(STORAGE_KEY));
    const session = state?.version === 1 ? state.session : null;
    return session && session.expiresAt > now ? session.user : null;
  } catch { return null; }
}

// fetch와 같은 인자를 받아 명세 형식의 Response를 반환한다. 공통 Client가 파싱한다.
export function createMockAuthFetch({ storage, now = Date.now }) {
  function readState() {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const state = JSON.parse(raw);
        if (state && typeof state === "object" && !Array.isArray(state) && state.version === 1) return state;
      } catch { /* 손상된 개발용 데이터는 초기 상태로 시작한다. */ }
    }
    return { version: 1, account: null, session: null, signup: null };
  }

  return async function mockFetch(url, init = {}) {
    init.signal?.throwIfAborted();
    const request = new Request(url, init);
    const path = new URL(request.url).pathname.replace(/^\/api\/v1\//, "");
    const method = request.method;
    let body = {};
    if (!["GET", "HEAD"].includes(method)) {
      try {
        const raw = await request.text();
        body = raw ? JSON.parse(raw) : {};
      } catch { return failure(400, "VALIDATION_ERROR", "요청 형식이 올바르지 않습니다."); }
      if (!body || typeof body !== "object" || Array.isArray(body)) return failure(400, "VALIDATION_ERROR", "요청 형식이 올바르지 않습니다.");
    }
    init.signal?.throwIfAborted();
    try {
      const state = readState();
      const save = () => storage.setItem(STORAGE_KEY, JSON.stringify(state));
      const login = (user, googleSub, data = {}, status = 200) => {
        state.session = { user, googleSub, expiresAt: now() + SESSION_LIFETIME_MS };
        state.signup = null;
        save();
        return success({ ...data, user: { id: user.id, name: user.name, part: user.part } }, status);
      };

      if (method === "POST" && path === "auth/google") {
        const identity = readMockGoogleIdentity(body.idToken, now());
        if (!identity) return failure(401, "UNAUTHORIZED", "Google 인증에 실패했습니다.");
        if (state.account && (!state.account.googleSub || state.account.googleSub === identity.sub)) {
          const user = { ...state.account.user, email: identity.email ?? state.account.user.email };
          state.account = { user, googleSub: identity.sub };
          return login(user, identity.sub, { registered: true, signupToken: null, email: null, suggestedName: null });
        }
        const signupToken = `mock-signup-${crypto.randomUUID()}`;
        state.signup = { signupToken, expiresAt: now() + SIGNUP_LIFETIME_MS,
          identity: { sub: identity.sub, email: identity.email, name: identity.name } };
        state.session = null;
        save();
        return success({ registered: false, user: null, signupToken,
          email: identity.email ?? MOCK_USER.email, suggestedName: identity.name ?? MOCK_USER.name });
      }
      if (method === "POST" && path === "auth/signup") {
        const pending = state.signup;
        if (!pending || pending.signupToken !== body.signupToken || pending.expiresAt <= now()) return failure(401, "UNAUTHORIZED", "가입 시간이 만료되었어요. 다시 로그인해 주세요.");
        const fields = validateBasicFields(body);
        if (!Object.hasOwn(AUTH_PART_LABELS, body.part)) fields.part = "파트를 하나 골라 주세요.";
        if (body.privacyAgreed !== true) fields.privacyAgreed = "개인정보 처리에 동의해 주세요.";
        if (Object.keys(fields).length) return failure(400, "VALIDATION_ERROR", "입력값을 확인해 주세요.", fields);
        const user = { ...MOCK_USER, email: pending.identity.email ?? MOCK_USER.email, name: body.name.trim(),
          studentNo: body.studentNo, department: body.department.trim(), cohort: body.cohort, part: body.part };
        state.account = { user, googleSub: pending.identity.sub };
        return login(user, pending.identity.sub, {}, 201);
      }
      if (method === "POST" && path === "auth/demo") return login({ ...MOCK_USER, id: 2 }, null);
      if (method === "POST" && path === "auth/logout") {
        state.session = null;
        state.signup = null;
        save();
        return success(null);
      }
      if (["GET", "PATCH", "DELETE"].includes(method) && path === "users/me") {
        const session = state.session;
        if (!session || session.expiresAt <= now()) {
          state.session = null;
          save();
          return failure(401, "UNAUTHORIZED", "로그인이 만료되었습니다.");
        }
        if (method === "GET") return success(session.user);
        if (method === "PATCH") {
          const fields = validateBasicFields(body, true);
          if (Object.keys(fields).length) return failure(400, "VALIDATION_ERROR", "입력값을 확인해 주세요.", fields);
          const user = { ...session.user };
          for (const field of ["name", "studentNo", "department", "cohort"]) {
            if (Object.hasOwn(body, field)) user[field] = typeof body[field] === "string" ? body[field].trim() : body[field];
          }
          state.session = { ...session, user };
          if (session.googleSub) state.account = { user, googleSub: session.googleSub };
          save();
          return success(user);
        }
        const identity = readMockGoogleIdentity(body.idToken, now());
        if (!session.googleSub || !identity || identity.sub !== session.googleSub) return failure(401, "UNAUTHORIZED", "가입한 Google 계정으로 다시 본인 확인해 주세요.");
        state.account = null;
        state.session = null;
        state.signup = null;
        save();
        return success(undefined, 204);
      }
      return failure(404, "NOT_FOUND", "요청한 기능을 찾을 수 없습니다.");
    } catch {
      return failure(503, "INTERNAL_ERROR", "mock 데이터를 저장할 수 없어요. 브라우저 저장소 사용을 허용해 주세요.");
    }
  };
}

export function mockAuthFetch(url, init) {
  try {
    return createMockAuthFetch({ storage: window.localStorage })(url, init);
  } catch {
    return Promise.resolve(failure(503, "INTERNAL_ERROR", "mock 데이터를 저장할 수 없어요. 브라우저 저장소 사용을 허용해 주세요."));
  }
}
