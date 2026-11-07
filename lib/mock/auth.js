// 개발용 HTTP 서버에서만 사용한다. 실제 Google 토큰 검증은 백엔드가 담당한다.
const MOCK_USER = {
  id: 1, email: "lion.cau@gmail.com", name: "김사자", studentNo: "20231234",
  department: "소프트웨어학부", cohort: 14, part: "PLAN_DESIGN",
};

function success(data) {
  return Response.json({ success: true, data, error: null }, { headers: { "Cache-Control": "no-store" } });
}

function failure(status, code, message) {
  return Response.json({ success: false, data: null, error: { code, message } },
    { status, headers: { "Cache-Control": "no-store" } });
}

export function createMockAuthHandler({ registered = false, now = Date.now } = {}) {
  const sessions = new Map();
  function issueSession(user) {
    const accessToken = `mock-access-${crypto.randomUUID()}`;
    sessions.set(accessToken, { user, expiresAt: now() + 7 * 24 * 60 * 60 * 1000 });
    return { accessToken, user: { id: user.id, name: user.name, part: user.part } };
  }
  return async function handle(request, path) {
    if (request.method === "POST" && path === "auth/google") {
      let body;
      try { body = await request.json(); } catch { return failure(400, "VALIDATION_ERROR", "요청 형식이 올바르지 않습니다."); }
      if (typeof body?.idToken !== "string" || !body.idToken || body.idToken === "mock-expired-google-token") {
        return failure(401, "UNAUTHORIZED", "Google 인증에 실패했습니다.");
      }
      if (registered) return success({ registered: true, ...issueSession(MOCK_USER), signupToken: null, email: null, suggestedName: null });
      return success({ registered: false, accessToken: null, user: null,
        signupToken: `mock-signup-${crypto.randomUUID()}`, email: MOCK_USER.email, suggestedName: MOCK_USER.name });
    }
    if (request.method === "POST" && path === "auth/demo") return success(issueSession({ ...MOCK_USER, id: 2 }));
    if (request.method === "GET" && path === "users/me") {
      const token = request.headers.get("Authorization")?.match(/^Bearer (.+)$/)?.[1];
      const session = sessions.get(token);
      if (!session || session.expiresAt <= now()) {
        sessions.delete(token);
        return failure(401, "UNAUTHORIZED", "로그인이 만료되었습니다.");
      }
      return success(session.user);
    }
    return failure(404, "NOT_FOUND", "요청한 기능을 찾을 수 없습니다.");
  };
}
