function readMode(value, fallback, allowed, label) {
  const mode = value || fallback;
  if (!allowed.includes(mode)) throw new Error(`${label} 설정이 올바르지 않습니다.`);
  return mode;
}

export function getAuthMode() {
  return readMode(process.env.NEXT_PUBLIC_AUTH_MODE,
    process.env.NODE_ENV === "development" ? "mock" : "live", ["mock", "live"], "인증 API");
}

export function getGoogleAuthMode() {
  return readMode(process.env.NEXT_PUBLIC_GOOGLE_AUTH_MODE,
    process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? "mock" : "google",
    ["mock", "google"], "Google 인증");
}

export const AUTH_PART_LABELS = {
  PLAN_DESIGN: "기획·디자인", FRONTEND: "프론트엔드", BACKEND: "백엔드",
};
