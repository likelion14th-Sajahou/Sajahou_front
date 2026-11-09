import { authRequest, getCurrentUser, validateUser } from "./auth.js";

const EDITABLE_FIELDS = ["name", "studentNo", "department", "cohort"];

// changes에는 변경된 API 필드만 전달한다. email·part 등은 요청에서 제외한다.
// request를 주면 AuthProvider의 인증·세션 변경 보호를 적용할 수 있다.
export function updateProfile(changes, { signal, request = authRequest } = {}) {
  const body = {};
  for (const field of EDITABLE_FIELDS) {
    if (Object.hasOwn(changes, field) && changes[field] !== undefined) body[field] = changes[field];
  }
  return request("/users/me", { method: "PATCH", body, signal, timeoutMs: 15000 });
}

// 재인증 실패도 401이다. 세션 정리 여부는 호출부에서 판단한다.
export function withdrawAccount(idToken, { signal, request = authRequest } = {}) {
  if (typeof idToken !== "string" || !idToken.trim()) {
    throw new Error("Google 본인 확인이 필요합니다. 다시 인증해 주세요.");
  }
  return request("/users/me", { method: "DELETE", body: { idToken }, signal, timeoutMs: 15000 });
}

// 탈퇴의 401만으로는 세션 만료인지 판단할 수 없다. 재조회도 401일 때만 만료로 본다.
// 네트워크·서버·응답 형식 오류는 호출부에 전달해 로그인 상태를 보존한다.
export async function checkWithdrawalSession({ signal } = {}) {
  try {
    return validateUser(await getCurrentUser({ signal }));
  } catch (error) {
    if (error.status === 401) return null;
    throw error;
  }
}
