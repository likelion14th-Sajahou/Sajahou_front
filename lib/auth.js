import { apiRequest } from "./apiClient.js";
import { getAuthMode, getGoogleAuthMode, AUTH_PART_LABELS } from "./authConfig.js";

// 응답 출처만 설정으로 바꾼다. Mock도 공통 Client의 JSON·오류 처리를 통과한다.
// 토큰 보관·세션 복원 정책은 이 함수에서 결정하지 않는다.
export async function authRequest(path, options = {}) {
  const mode = getAuthMode();
  if (mode === "mock") {
    const { mockApiFetch } = await import("./mock/api.js");
    return apiRequest(path, { ...options, cache: "no-store", baseUrl: window.location.origin, fetcher: mockApiFetch });
  }
  return apiRequest(path, {
    ...options,
    cache: "no-store",
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
