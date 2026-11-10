import { apiRequest } from "./apiClient.js";
import { getAuthMode, getGoogleAuthMode, AUTH_PART_LABELS } from "./authConfig.js";

// 응답 출처만 설정으로 바꾼다. Mock도 공통 Client의 JSON·오류 처리를 통과한다.
async function send(path, options) {
  if (getAuthMode() === "mock") {
    const { mockApiFetch } = await import("./mock/api.js");
    return apiRequest(path, { ...options, cache: "no-store", baseUrl: window.location.origin, fetcher: mockApiFetch });
  }
  return apiRequest(path, { ...options, cache: "no-store" });
}

// 백엔드 CSRF 검사(이슈 #32). GET이 아닌 모든 요청(파일 업로드 포함)은 GET /auth/csrf로 받은 토큰을
// 응답이 알려 준 헤더 이름(data.headerName)으로 보낸다. 토큰은 서버 세션에 묶여 있어서 같은 세션 동안 다시 쓰고,
// 로그아웃·탈퇴·세션 만료(401) 뒤에는 버린다. 토큰 조회와 요청 모두 공통 Client라 같은 세션 쿠키를 보낸다.
const SAFE_METHODS = ["GET", "HEAD"];
let csrfHeaders = null;
let csrfLoading = null;

export function clearCsrfToken() {
  csrfHeaders = null;
}

// 동시에 여러 요청이 토큰을 기다려도 조회는 한 번만 한다. 한 화면의 취소가 다른 요청에 번지지 않게 signal은 넘기지 않는다.
function getCsrfHeaders() {
  if (csrfHeaders) return Promise.resolve(csrfHeaders);
  csrfLoading ??= send("/auth/csrf", { timeoutMs: 15000 })
    .then((csrf) => {
      if (typeof csrf?.headerName !== "string" || !csrf.headerName || typeof csrf.token !== "string" || !csrf.token) {
        throw new Error("보안 확인 정보를 받지 못했어요. 다시 시도해 주세요.");
      }
      csrfHeaders = { [csrf.headerName]: csrf.token };
      return csrfHeaders;
    })
    .finally(() => { csrfLoading = null; });
  return csrfLoading;
}

// 모든 API 요청의 공통 진입점이다. 토큰 보관·세션 복원 정책은 이 함수에서 결정하지 않는다.
export async function authRequest(path, options = {}) {
  const method = (options.method ?? "GET").toUpperCase();
  const withCsrf = async () => {
    if (SAFE_METHODS.includes(method)) return send(path, options);
    const headers = new Headers(options.headers);
    for (const [name, value] of Object.entries(await getCsrfHeaders())) headers.set(name, value);
    return send(path, { ...options, headers });
  };
  try {
    return await withCsrf();
  } catch (error) {
    if (error.status === 401) clearCsrfToken();
    // 서버 재시작·세션 교체로 토큰이 맞지 않으면 403이다. 토큰을 새로 받아 딱 한 번만 다시 보낸다.
    // 백엔드는 403 CSRF_INVALID로 통일할 예정이고, 그 전에는 스프링 기본 403 형식이 온다.
    if (error.status !== 403 || SAFE_METHODS.includes(method) || options.signal?.aborted) throw error;
    clearCsrfToken();
    return withCsrf();
  }
}

export function loginWithGoogle(idToken, { signal } = {}) {
  if (!idToken) throw new Error("Google 인증 결과가 없습니다. 다시 로그인해 주세요.");
  if (getAuthMode() === "live" && getGoogleAuthMode() === "mock") {
    throw new Error("실제 API를 사용하려면 Google 인증을 연결해야 합니다.");
  }
  return authRequest("/auth/google", {
    method: "POST",
    body: { idToken },
    signal,
    timeoutMs: 15000,
  });
}

export function loginDemo({ signal } = {}) {
  return authRequest("/auth/demo", { method: "POST", signal, timeoutMs: 15000 });
}

export function signupWithGoogle(values, { signal } = {}) {
  const { signupToken, name, studentNo, department, cohort, part, privacyAgreed } = values;
  return authRequest("/auth/signup", {
    method: "POST",
    body: { signupToken, name, studentNo, department, cohort, part, privacyAgreed },
    signal,
    timeoutMs: 15000,
  });
}

export function getCurrentUser({ signal } = {}) {
  return authRequest("/users/me", { signal, timeoutMs: 15000 });
}

export function logoutSession() {
  // 로그아웃하면 서버 세션과 함께 CSRF 토큰도 사라진다.
  return authRequest("/auth/logout", { method: "POST", timeoutMs: 15000 }).finally(clearCsrfToken);
}

export function validateUser(user) {
  if (!user || user.id == null || typeof user.name !== "string" || !Object.hasOwn(AUTH_PART_LABELS, user.part)) {
    throw new Error("사용자 정보를 확인할 수 없습니다. 다시 로그인해 주세요.");
  }
  return user;
}

export function getGoogleLoginDestination(result) {
  if (result?.registered === false && result.signupToken && typeof result.email === "string" && result.email) return "/signup";
  if (result?.registered === true) return "/";
  throw new Error("로그인 응답을 확인할 수 없습니다. 다시 시도해 주세요.");
}
