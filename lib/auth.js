import { apiRequest } from "./apiClient.js";
import { getAuthMode, getGoogleAuthMode, AUTH_PART_LABELS } from "./authConfig.js";

// 응답 출처만 설정으로 바꾼다. Mock도 공통 Client의 HTTP·JSON·오류 처리를 통과한다.
// 토큰 보관·세션 복원 정책은 이 함수에서 결정하지 않는다.
export function authRequest(path, options = {}) {
  const mode = getAuthMode();
  return apiRequest(path, {
    ...options,
    cache: "no-store",
    ...(mode === "mock" ? { baseUrl: window.location.origin } : {}),
  });
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

export function getCurrentUser({ signal } = {}) {
  return authRequest("/users/me", { signal, timeoutMs: 15000 });
}

export function logoutSession() {
  return authRequest("/auth/logout", { method: "POST", timeoutMs: 15000 });
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
