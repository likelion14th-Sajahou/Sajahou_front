import { authRequest } from "./auth.js";

// 홈 화면 데이터(GET /home): 사용자·이번 주차·이번 주 회고 상태·프로젝트·최근 카드. 화면은 authenticatedRequest를 request로 넘긴다.
export function getHome({ request = authRequest, signal } = {}) {
  return request("/home", { signal, timeoutMs: 15000 });
}
