import { mockAuthFetch } from "./auth.js";
import { mockRetrospectiveFetch } from "./retrospectiveApi.js";

// mock 모드의 요청을 경로에 맞는 도메인 mock으로 보낸다. 새 도메인 mock을 만들면 여기에 경로를 더한다.
const DOMAIN_MOCKS = [
  { pattern: /^\/api\/v1\/retrospectives(\/|$)/, fetch: mockRetrospectiveFetch },
  // 질문 답하기(18번)는 회고·기록·마치기 질문이 함께 쓰는 경로다. 지금은 회고 질문만 mock이 있다.
  { pattern: /^\/api\/v1\/questions\//, fetch: mockRetrospectiveFetch },
];

export function mockApiFetch(url, init) {
  const { pathname } = new URL(url instanceof Request ? url.url : url);
  const domain = DOMAIN_MOCKS.find(({ pattern }) => pattern.test(pathname));
  return (domain?.fetch ?? mockAuthFetch)(url, init);
}
