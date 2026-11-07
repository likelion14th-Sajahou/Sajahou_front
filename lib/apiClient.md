# 공통 API Client 사용 가이드

`lib/apiClient.js`의 `apiRequest`는 요청 데이터 구성, 공통 응답 파싱, 오류 전달, 타임아웃과 취소를 담당한다. 토큰 저장·갱신, 재시도, 알림, 화면 전환은 호출부의 책임이다. UI와 Mock에는 연결하지 않았다.

기준은 [사자록 API 명세]다. 아래 예시는 사용법을 설명하는 문서이며, 개별 엔드포인트 함수나 실제 호출을 프로젝트에 추가한 것이 아니다.

## 1. 환경변수

루트 `.env.example`을 `.env.local`로 복사하고 백엔드 주소를 설정한다.

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

origin 또는 `/api/v1`까지 지정할 수 있다. Client가 `/api/v1`을 한 번 연결하므로 호출 경로에는 접두사를 넣지 않는다. 환경변수가 없으면 요청 시 `TypeError`가 발생한다. 모듈을 import하는 것만으로 요청하지는 않는다.

같은 함수를 서버와 브라우저에서 사용할 수 있다. `NEXT_PUBLIC_`에는 공개 가능한 백엔드 주소만 넣는다. 이 값은 Next.js 빌드 시 고정되므로 배포 주소를 바꾸면 다시 빌드한다. 비밀값이나 토큰은 넣지 않는다.

## 2. 옵션과 반환값

```js
import { apiRequest, ApiError } from "@/lib/apiClient";

const data = await apiRequest(path, options);
```

| 옵션 | 처리 |
| --- | --- |
| `method` | 기본 `GET`. POST, PUT, PATCH, DELETE 등 fetch의 메서드 전달 |
| `query` | 객체 또는 URLSearchParams. URL에 있는 쿼리에 추가 |
| `body` | JSON 값 또는 FormData |
| `headers` | 객체, Headers, 키·값 쌍 배열 등 fetch의 HeadersInit |
| `token` | 해당 요청에만 `Authorization: Bearer ...` 설정 |
| `timeoutMs` | 선택 사항. 1~2147483647의 정수(ms), 생략하면 Client 자체 타임아웃 없음 |
| `signal` | 호출부 AbortController의 signal 전달 |
| `baseUrl` | 선택 사항. 해당 요청의 API origin을 지정. 인증 HTTP mock은 현재 origin 사용 |
| 나머지 | `cache`, `next`, `credentials` 등 fetch 옵션 그대로 전달 |

경로는 `/users/me`처럼 `/api/v1` 이후 부분을 전달한다. 동적 path 값은 호출부에서 `encodeURIComponent`로 인코딩한다. GET/HEAD에는 body 대신 query를 사용한다.

성공 시 공통 응답 `{ success: true, data, error }`의 **data만 반환**한다. 배열, null, false도 그대로 유지한다. 반환값에 다시 `.data`나 `.json()`을 호출하지 않는다. 204, HEAD 및 본문 없는 성공 응답은 `undefined`다.

명세의 공통 설명에는 성공 시 `error: null`이라고 되어 있지만 일부 성공 예시에는 오류 객체 자리표시자가 남아 있다. Client는 HTTP 상태와 `success`로 성공 여부를 판단한다.

### 요청 데이터와 헤더 규칙

- JSON body는 Client가 직렬화하므로 호출부에서 `JSON.stringify`하지 않는다. 문자열을 주면 JSON 문자열로 직렬화한다. 원시 바이너리·스트림 body는 현재 지원 범위가 아니다.
- JSON body가 있으면 기본 `Content-Type: application/json`을 설정한다. 요청별 Content-Type을 명시하면 유지하므로 body와 맞는 값을 사용한다.
- FormData는 그대로 전달하고 Content-Type을 제거한다. 런타임이 boundary를 포함해 헤더를 설정한다.
- 공통 `Accept: application/json`은 요청별 헤더로 덮어쓸 수 있다. `token`이 있으면 요청별 Authorization보다 우선한다.
- 토큰을 생략하면 Bearer 헤더를 자동 생성하지 않는다. 단, 호출부가 `headers.Authorization`을 직접 지정한 경우 그 헤더는 유지한다.
- query 객체의 null/undefined는 생략하고 0/false는 유지한다. 배열은 같은 키를 반복한다. 이는 Client의 표현 규칙이며, 실제 API의 쿼리 키와 허용 형식은 명세를 따른다. 현재 명세의 `/story-cards`에는 배열 쿼리가 정의되어 있지 않다.

## 3. 사용 예시

각 예시는 위 import를 사용한다. `accessToken`, `idToken`, `file`, `retrospectiveId`는 호출부가 제공하는 값이다.

### 일반 GET

```js
const me = await apiRequest("/users/me", { token: accessToken });
// me는 data에 해당하는 사용자 객체다.
```

### Bearer Token이 필요한 POST

```js
const project = await apiRequest("/projects", {
  method: "POST",
  token: accessToken,
  body: { name: "사자록", subtitle: null, roles: ["FRONTEND"] },
});
```

### 인증이 필요 없는 요청

```js
const login = await apiRequest("/auth/google", {
  method: "POST",
  body: { idToken },
});
```

명세에서 `/auth/google`, `/auth/signup`, `/auth/demo`는 Bearer 인증 예외다. 해당 호출에는 token이나 Authorization을 전달하지 않는다. Client가 경로로 인증 여부를 추정하거나 토큰 누락을 차단하지는 않는다.

### Query Parameter

```js
const result = await apiRequest("/story-cards", {
  token: accessToken,
  query: { type: "SESSION", competencyId: 5, weekNumber: 9, q: "협업" },
});
// /api/v1/story-cards?type=SESSION&competencyId=5&weekNumber=9&q=...
```

### FormData 파일 업로드

```js
const form = new FormData();
form.append("file", file);
form.append("category", "OUTPUT");

const attachment = await apiRequest("/attachments/files", {
  method: "POST",
  token: accessToken,
  body: form,
});
// Content-Type을 직접 지정하지 않는다.
```

### AI 요청의 긴 타임아웃과 취소

```js
const controller = new AbortController();
const pending = apiRequest(
  `/retrospectives/${encodeURIComponent(retrospectiveId)}/questions`,
  {
    method: "POST",
    token: accessToken,
    body: { mode: "AUTO" },
    timeoutMs: 90000,
    signal: controller.signal,
  },
);

// 화면 이탈이나 취소 동작에서 필요할 때 controller.abort()를 호출한다.
const result = await pending;
```

명세상 AI 응답은 최대 50초이므로 AI 호출부에서 **60000ms 이상**을 지정한다. Client는 엔드포인트를 보고 타임아웃을 자동 지정하지 않는다. 예시의 90000ms는 선택 가능한 값이다.

타임아웃은 fetch 시작부터 응답 본문 수신까지 적용한다. 완료 시 타이머를 정리하며, 외부 취소와 타임아웃 중 먼저 발생한 signal의 원인으로 구분한다. 요청 취소가 서버 작업의 중단을 보장하지는 않으므로 AI 요청의 재실행 여부는 호출부에서 결정한다.

### 오류 처리

```js
try {
  const project = await apiRequest("/projects", {
    method: "POST",
    token: accessToken,
    body: { name: "사자록", subtitle: null, roles: ["FRONTEND"] },
  });
  // project 사용
} catch (error) {
  if (!(error instanceof ApiError)) throw error;

  if (error.status === 401) {
    // 인증 관리 계층에서 처리한다.
  } else if (error.isValidationError) {
    // error.fields를 입력칸 오류 표시에 사용한다.
  } else if (error.kind === "timeout") {
    // Client의 요청 시간 초과. 서버 AI_TIMEOUT 응답과 구분한다.
  } else if (error.kind === "aborted") {
    // 외부 signal에 따른 요청 취소다.
  } else {
    // error.code와 error.message에 따라 호출부에서 피드백을 결정한다.
  }
}
```

## 4. 오류 정보

HTTP 실패 또는 `success:false`는 `ApiError`로 전달된다. 잘못된 환경변수·타임아웃 값 등 요청 준비 단계의 오류는 TypeError/RangeError로 전달될 수 있다.

| `kind` | 의미 | 서버 코드가 없을 때 사용하는 Client 코드 |
| --- | --- | --- |
| `http` | HTTP 실패. 본문이 HTML이나 빈 문자열이어도 상태 유지 | `HTTP_ERROR` |
| `business` | HTTP 성공이지만 `success:false` | `BUSINESS_ERROR` |
| `parse` | HTTP 성공 응답의 JSON 파싱 실패 | `INVALID_JSON` |
| `response` | JSON이지만 success/data 공통 형식이 맞지 않음 | `INVALID_RESPONSE` |
| `network` | fetch 또는 응답 본문 수신 실패 | `NETWORK_ERROR` |
| `timeout` | Client의 요청 시간 초과 | `TIMEOUT` |
| `aborted` | 외부 signal로 취소 | `ABORTED` |

위 kind와 Client 코드는 프론트엔드가 구분을 위해 정의한 값이며 백엔드 명세의 오류 코드가 아니다. 서버가 `error.code`를 제공하면 해당 코드를 보존한다. 예를 들어 서버의 HTTP 504 `AI_TIMEOUT`은 `kind: "http"`이고, Client 타이머에 의한 중단은 `kind: "timeout"`, `code: "TIMEOUT"`이다.

| 속성 | 내용 |
| --- | --- |
| `status` | 확보한 HTTP 상태. 응답 수신 전 실패하면 null |
| `code`, `message` | 서버 오류 코드·메시지, 없으면 Client 대체값 |
| `error` | 알 수 없는 필드도 포함하는 서버 error 객체 전체 |
| `fields`, `detail` | 서버 error 객체의 원본 값 |
| `isValidationError` | 코드가 명세의 `VALIDATION_ERROR`인지 여부 |
| `payload` | 파싱한 전체 응답 |
| `rawBody` | 수신한 본문 문자열 |
| `cause` | 네트워크·파싱·취소 등의 원래 원인 |

단순히 HTTP 400이라는 이유로 입력 검증 오류로 분류하지 않는다. 본문 수신 자체가 실패하면 payload/rawBody를 확보하지 못할 수 있다. 오류 객체에 응답 개인정보가 포함될 수 있으므로 외부 로그에 통째로 기록하지 않는다.

## 5. 협업과 Mock 전환

1. 담당 API의 메서드, 경로, query/body, 인증, 성공·실패 구조를 명세에서 확인한 뒤 담당 함수를 작성한다. 파일 배치는 기존 구조와 팀 합의를 따른다.
2. 담당 함수에서 이 Client를 호출한다. 공통 헤더·JSON 직렬화·응답 파싱을 중복 구현하지 않는다.
3. 인증 관리 계층에서 받은 토큰을 요청마다 전달한다. Client에 전역 사용자 토큰, 스토리지 조회, 자동 갱신을 추가하지 않는다.
4. 로딩·빈 데이터·오류 알림·화면 이동은 호출부에서 처리한다. 공통 Client에 화면별 로직을 넣지 않는다.
5. 캐싱 정책은 요청별로 검토한다. Client가 일괄 강제하지 않으며, 필요하면 `cache: "no-store"`를 전달한다. 서버의 `next` 캐시 옵션은 브라우저에서 같은 기능을 제공하지 않는다. `cache: "no-store"`와 양수 `next.revalidate`처럼 충돌하는 옵션을 함께 주지 않는다.
6. Mock 전환 시 실제 data 구조·상태·빈 값과 UI 요구를 비교한다. Client를 Mock 데이터 모양에 맞추거나 변환 어댑터를 넣지 않는다.
7. 백엔드 준비 후 실제 주소, CORS·HTTPS, 인증, 업로드, 오류 응답, AI 지연을 확인한다. 현재 테스트는 실제 연동을 검증한 것이 아니다.
