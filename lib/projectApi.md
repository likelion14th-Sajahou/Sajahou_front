# 프로젝트 API와 Mock

화면은 `lib/projectApi.js`의 함수를 사용한다. `NEXT_PUBLIC_AUTH_MODE=mock|live` 설정으로 요청 출처만 바뀐다. live는 기존 `apiRequest`와 HttpOnly 세션 쿠키(`credentials: include`)를 사용한다. 라이브러리나 인증 정책은 추가하지 않는다. Mock은 브라우저 전용이다.

## 명세 기준

`likelion14-sajahou-docs/최신API명세서.url` → [API 명세](https://www.notion.so/efdacc3e492082ce91ad81e60e4b39d2)의 **데이터베이스 개별 항목**을 기준으로 한다. 하위 과거 통합 문서는 사용하지 않는다.

- 4·6·7~10·18·22~34·43·44 중 프로젝트 흐름에 필요한 요청을 제공한다. 35번은 사용하지 않는다.
- 26·27·28: SAVED 기록 = 카드 1장. DRAFT는 목록·기록 수에서 제외한다.
- 22번 데이터베이스에는 `sourceRecords`, `deletedRecordCount`가 남아 있다. 응답 필드명을 유지하면서 1:1 관계로 동작한다.
- 역량 ID는 mock 전용 fixture다. 화면은 `/competencies`에서 받은 ID를 사용해야 한다.

## 잠정 계약 — 백엔드 답변 후 변경 가능

1. 28번 PATCH에서 `memo`를 전송·수정한다.
2. 30번에 `{ regenerate: true }`를 보내면 기존 질문·답을 교체한다. **이 필드는 명세 확정 사항이 아니다.** 일반 재호출은 본문 없이 저장된 질문·답을 반환한다. UI에서 재생성 성공 전에 기존 답을 지우지 않는다.

확정된 전송 형식으로 바뀌면 `getRecordQuestions`와 mock의 해당 분기를 함께 조정한다. 새로운 endpoint를 확정된 계약처럼 추가하지 않는다.

## 저장 및 한계

- 기존 인증 mock으로 로그인 후 사용한다. 사용자별 `sajarok_mock_projects_v1:<id>`에 JSON을 보관한다. 처음에는 빈 프로젝트 목록이다.
- 새로고침·재로그인 후 유지하고 다른 사용자 데이터에 접근할 수 없다. 회원 탈퇴 시 해당 저장소를 삭제한다.
- 파일 본문·실제 인증 토큰은 저장하지 않는다. 파일 크기·확장자·메타데이터만 검증하며 링크를 실제로 수집하지 않는다.
- AI는 고정 질문과 사용자가 입력한 문장으로 모의 정리한다. 실 AI 품질·파일 추출·CORS·쿠키는 실제 서버에서 별도 검증한다.
- DRAFT는 24시간 이후 다음 요청에서 정리한다. 프론트의 미저장 입력·페이지 복원은 UI 작업 단계에서 처리한다.

## 오류·지연 시나리오

테스트의 `createMockProjectFetch({ storage, now, scenario })`로 지연과 오류를 주입한다. `scenario({path, method, user})`는 `{delayMs, error, status, extractStatus}`를 반환한다. AI 호출 중 같은 대상의 중복 호출은 409다. 취소·타임아웃 후 mutation은 반영하지 않는다.

브라우저 개발자 도구에서 `sajarok_mock_project_scenario` localStorage 키에 JSON을 설정해 오류를 재현할 수 있다. 예: `{"delayMs":800,"error":"AI_FAILED","status":502}`. 테스트 후 키를 삭제한다. 실제 50초 대기는 `delayMs:50000`, 클라이언트 시간 초과는 65000ms보다 길게 설정한다. 이 설정은 mock에서만 읽고 API 요청 본문에는 넣지 않는다.

검증: `node --test lib/projectApi.test.js lib/profileApi.test.js lib/mock/auth.test.js`
