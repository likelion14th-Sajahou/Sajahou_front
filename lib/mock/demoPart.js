// 회고 화면의 '데모 · 파트 바꿔 보기'로 고른 파트(API 코드)다. 시연용이라 mock 응답만 이 값을 쓴다.
// 실제 백엔드는 가입할 때 고른 파트로 마감일을 준다(R-07).
let demoPart = null;

export function setMockDemoPart(part) {
  demoPart = part;
}

export function getMockDemoPart() {
  return demoPart;
}
