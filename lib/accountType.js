// 탈퇴 UI의 표시 여부를 위한 힌트다. 인증·권한의 근거로 사용하지 않는다.
// 토큰이나 이메일은 저장하지 않으며, 확인할 수 없으면 탈퇴 UI를 열지 않는다.
const STORAGE_KEY = "sajarok_account_type";

export function readAccountType(userId) {
  try {
    const hint = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY));
    if (hint?.userId === userId && ["google", "demo"].includes(hint.type)) return hint.type;
  } catch { /* 저장소 사용 불가·잘못된 값은 미확인 상태로 처리한다. */ }
  return "unknown";
}

export function rememberAccountType(userId, type) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ userId, type }));
  } catch { /* 현재 탭의 React 상태는 유지한다. */ }
}

export function forgetAccountType() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch { /* 저장소를 사용할 수 없어도 로그아웃은 진행한다. */ }
}
