import { AUTH_PART_LABELS } from "../authConfig.js";

// 개발용 HTTP 서버에서만 사용한다. 실제 Google 토큰 검증은 백엔드가 담당한다.
const MOCK_USER = {
  id: 1, email: "lion.cau@gmail.com", name: "김사자", studentNo: "20231234",
  department: "소프트웨어학부", cohort: 14, part: "PLAN_DESIGN",
};

// 개발 mock 전용 값이다. 실제 백엔드의 쿠키 이름·만료 정책과는 독립적이다.
const SESSION_COOKIE = "sajarok_mock_session";
const SESSION_LIFETIME_SECONDS = 7 * 24 * 60 * 60;

function getSessionId(request) {
  return request.headers.get("Cookie")?.split(";").map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
}

function sessionCookie(request, value, maxAge) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function success(data, status = 200) {
  return Response.json({ success: true, data, error: null }, { status, headers: { "Cache-Control": "no-store" } });
}

function failure(status, code, message, fields) {
  return Response.json({ success: false, data: null, error: { code, message, ...(fields ? { fields } : {}) } },
    { status, headers: { "Cache-Control": "no-store" } });
}

export function createMockAuthHandler({ registered = false, now = Date.now } = {}) {
  const sessions = new Map();
  const signupTokens = new Map();
  let registeredUser = registered ? MOCK_USER : null;
  function clearSession(request, response) {
    sessions.delete(getSessionId(request));
    response.headers.set("Set-Cookie", sessionCookie(request, "", 0));
    return response;
  }
  function issueSession(request, user, data = {}, status = 200) {
    const currentTime = now();
    for (const [id, session] of sessions) {
      if (session.expiresAt <= currentTime) sessions.delete(id);
    }
    sessions.delete(getSessionId(request));
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, { user, expiresAt: currentTime + SESSION_LIFETIME_SECONDS * 1000 });
    const response = success({ ...data, user: { id: user.id, name: user.name, part: user.part } }, status);
    response.headers.set("Set-Cookie", sessionCookie(request, sessionId, SESSION_LIFETIME_SECONDS));
    return response;
  }
  return async function handle(request, path) {
    if (request.method === "POST" && path === "auth/google") {
      let body;
      try { body = await request.json(); } catch { return failure(400, "VALIDATION_ERROR", "요청 형식이 올바르지 않습니다."); }
      if (typeof body?.idToken !== "string" || !body.idToken || body.idToken === "mock-expired-google-token") {
        return failure(401, "UNAUTHORIZED", "Google 인증에 실패했습니다.");
      }
      if (registeredUser) return issueSession(request, registeredUser, { registered: true, signupToken: null, email: null, suggestedName: null });
      for (const [token, expiresAt] of signupTokens) {
        if (expiresAt <= now()) signupTokens.delete(token);
      }
      const signupToken = `mock-signup-${crypto.randomUUID()}`;
      signupTokens.set(signupToken, now() + 10 * 60 * 1000);
      return clearSession(request, success({ registered: false, user: null,
        signupToken, email: MOCK_USER.email, suggestedName: MOCK_USER.name }));
    }
    if (request.method === "POST" && path === "auth/signup") {
      let body;
      try { body = await request.json(); } catch { return failure(400, "VALIDATION_ERROR", "요청 형식이 올바르지 않습니다."); }
      const expiresAt = signupTokens.get(body?.signupToken);
      if (!expiresAt || expiresAt <= now()) {
        signupTokens.delete(body?.signupToken);
        return failure(401, "UNAUTHORIZED", "가입 시간이 만료되었어요. 다시 로그인해 주세요.");
      }
      const fields = {};
      if (typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 50) fields.name = "이름은 1~50자로 입력해 주세요.";
      if (typeof body.studentNo !== "string" || !/^\d{8}$/.test(body.studentNo)) fields.studentNo = "학번은 숫자 8자리로 입력해 주세요.";
      if (typeof body.department !== "string" || !body.department.trim()) fields.department = "학과 이름을 입력해 주세요.";
      if (![12, 13, 14].includes(body.cohort)) fields.cohort = "기수를 골라 주세요.";
      if (!Object.hasOwn(AUTH_PART_LABELS, body.part)) fields.part = "파트를 하나 골라 주세요.";
      if (body.privacyAgreed !== true) fields.privacyAgreed = "개인정보 처리에 동의해 주세요.";
      if (Object.keys(fields).length) return failure(400, "VALIDATION_ERROR", "입력값을 확인해 주세요.", fields);
      signupTokens.clear();
      registeredUser = { ...MOCK_USER, name: body.name.trim(), studentNo: body.studentNo,
        department: body.department.trim(), cohort: body.cohort, part: body.part };
      return issueSession(request, registeredUser, {}, 201);
    }
    if (request.method === "POST" && path === "auth/demo") return issueSession(request, { ...MOCK_USER, id: 2 });
    if (request.method === "POST" && path === "auth/logout") return clearSession(request, success(null));
    if (request.method === "GET" && path === "users/me") {
      const session = sessions.get(getSessionId(request));
      if (!session || session.expiresAt <= now()) {
        return clearSession(request, failure(401, "UNAUTHORIZED", "로그인이 만료되었습니다."));
      }
      return success(session.user);
    }
    return failure(404, "NOT_FOUND", "요청한 기능을 찾을 수 없습니다.");
  };
}
