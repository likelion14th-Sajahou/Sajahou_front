import { mockAuthFetch } from "./auth.js";
import { mockServerFetch } from "./server.js";

// mock 모드의 요청을 경로에 맞는 mock으로 보낸다. 인증(로그인·가입·내 정보)은 인증 mock이,
// 나머지 도메인 API는 공통 진입점(server.js)이 사용자별 저장소 하나로 처리한다.
const SERVER_PATHS = /^\/api\/v1\/(home|competencies|footprints|story-cards|retrospectives|questions|projects|project-records|attachments)(\/|$)/;

export function mockApiFetch(url, init) {
  const { pathname } = new URL(url instanceof Request ? url.url : url);
  return (SERVER_PATHS.test(pathname) ? mockServerFetch : mockAuthFetch)(url, init);
}
