# 공통 API Client 사용 가이드

`lib/apiClient.js`의 `apiRequest`는 요청 데이터 구성, 공통 응답 파싱, 오류 전달, 타임아웃과 취소를 담당한다. live 모드의 브라우저 요청에는 `credentials: "include"`를 적용해 서버의 HttpOnly 세션 쿠키를 사용한다. mock 모드는 localStorage 기반으로 처리하며 동일한 응답 파싱과 오류 처리를 재사용한다. 재시도, 알림, 로그인 상태 관리와 화면 전환은 호출부의 책임이다.

실제 연동의 기준은 사자록 API 명세와 백엔드에서 확정한 세션 쿠키 인증 정책이다. 3절은 공통 Client 사용 예시이며, 구현된 인증·프로필 호출 함수와 mock 설정은 6~7절에서 설명한다.

## 1. 환경변수

루트 `.env.example`을 `.env.local`로 복사하고 백엔드 주소를 설정한다.

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

origin 또는 `/api/v1`까지 지정할 수 있다. Client가 `/api/v1`을 한 번 연결하므로 호출 경로에는 접두사를 넣지 않는다. 실제 요청에 환경변수나 `baseUrl`이 없으면 `TypeError`가 발생한다. 인증 mock은 현재 브라우저 origin을 지정하며 네트워크를 호출하지 않는다. 모듈을 import하는 것만으로 요청하지는 않는다.

같은 함수를 서버와 브라우저에서 사용할 수 있다. 단, 서버 호출에서는 `credentials: "include"`만으로 브라우저의 쿠키가 자동 전달되지 않는다. `NEXT_PUBLIC_`에는 공개 가능한 백엔드 주소만 넣는다. 이 값은 Next.js 빌드 시 고정되므로 배포 주소를 바꾸면 다시 빌드한다. 비밀값이나 토큰은 넣지 않는다.

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
| `credentials` | 항상 `include` 적용. 브라우저가 세션 쿠키를 저장·전송하며 호출부에서 덮어쓸 수 없음 |
| `timeoutMs` | 선택 사항. 1~2147483647의 정수(ms), 생략하면 Client 자체 타임아웃 없음 |
| `signal` | 호출부 AbortController의 signal 전달 |
| `baseUrl` | 선택 사항. 해당 요청의 API origin을 지정. 브라우저 mock은 현재 origin 사용 |
| `fetcher` | 선택 사항. 기본값은 실제 `fetch`. mock 모드에서만 localStorage 기반 모의 transport를 전달 |
| 나머지 | `cache`, `next` 등 fetch 옵션 그대로 전달 |

경로는 `/users/me`처럼 `/api/v1` 이후 부분을 전달한다. 동적 path 값은 호출부에서 `encodeURIComponent`로 인코딩한다. GET/HEAD에는 body 대신 query를 사용한다.

성공 시 공통 응답 `{ success: true, data, error }`의 **data만 반환**한다. 배열, null, false도 그대로 유지한다. 반환값에 다시 `.data`나 `.json()`을 호출하지 않는다. 204, HEAD 및 본문 없는 성공 응답은 `undefined`다.

명세의 공통 설명에는 성공 시 `error: null`이라고 되어 있지만 일부 성공 예시에는 오류 객체 자리표시자가 남아 있다. Client는 HTTP 상태와 `success`로 성공 여부를 판단한다.

### 요청 데이터와 헤더 규칙

- JSON body는 Client가 직렬화하므로 호출부에서 `JSON.stringify`하지 않는다. 문자열을 주면 JSON 문자열로 직렬화한다. 원시 바이너리·스트림 body는 현재 지원 범위가 아니다.
- JSON body가 있으면 기본 `Content-Type: application/json`을 설정한다. 요청별 Content-Type을 명시하면 유지하므로 body와 맞는 값을 사용한다.
- FormData는 그대로 전달하고 Content-Type을 제거한다. 런타임이 boundary를 포함해 헤더를 설정한다.
- 공통 `Accept: application/json`은 요청별 헤더로 덮어쓸 수 있다.
- accessToken을 저장하거나 Bearer 헤더를 생성하지 않는다. 호출부에서도 인증용 Authorization 헤더를 전달하지 않는다. HttpOnly 세션 쿠키는 브라우저가 관리한다.
- query 객체의 null/undefined는 생략하고 0/false는 유지한다. 배열은 같은 키를 반복한다. 이는 Client의 표현 규칙이며, 실제 API의 쿼리 키와 허용 형식은 명세를 따른다. 현재 명세의 `/story-cards`에는 배열 쿼리가 정의되어 있지 않다.

## 3. 사용 예시

각 예시는 위 import를 사용한다. `idToken`, `file`, `retrospectiveId`는 호출부가 제공하는 값이다.

### 일반 GET

```js
const me = await apiRequest("/users/me");
// me는 data에 해당하는 사용자 객체다.
```

### 세션 인증이 필요한 POST

```js
const project = await apiRequest("/projects", {
  method: "POST",
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

로그인·가입 요청에도 `credentials: "include"`가 적용되어 성공 응답의 세션 쿠키를 브라우저가 저장할 수 있다. Google idToken과 가입용 signupToken은 각 API 명세대로 요청 본문에 전달한다.

### Query Parameter

```js
const result = await apiRequest("/story-cards", {
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
3. live 모드는 세션 쿠키 인증을 사용한다. 요청마다 accessToken을 전달하거나 스토리지 조회·토큰 자동 갱신을 추가하지 않는다. mock 데이터의 localStorage 처리는 `lib/mock/auth.js`에서만 수행한다.
4. 로딩·빈 데이터·오류 알림·화면 이동은 호출부에서 처리한다. 공통 Client에 화면별 로직을 넣지 않는다.
5. 캐싱 정책은 요청별로 검토한다. Client가 일괄 강제하지 않으며, 필요하면 `cache: "no-store"`를 전달한다. 서버의 `next` 캐시 옵션은 브라우저에서 같은 기능을 제공하지 않는다. `cache: "no-store"`와 양수 `next.revalidate`처럼 충돌하는 옵션을 함께 주지 않는다.
6. Mock 전환 시 실제 data 구조·상태·빈 값과 UI 요구를 비교한다. Client를 Mock 데이터 모양에 맞추거나 변환 어댑터를 넣지 않는다.
7. 백엔드 준비 후 실제 주소, CORS·HTTPS, 인증, 업로드, 오류 응답, AI 지연을 확인한다. 현재 테스트는 실제 연동을 검증한 것이 아니다.

## 6. 내 정보 수정·탈퇴

`lib/profileApi.js`의 `updateProfile(changes, options)`는 변경한 API 필드를 받아 `PATCH /users/me`를 호출한다. `name`, `studentNo`, `department`, `cohort`만 전송하며 `email`, `part` 등은 제외한다. `department`에는 선택 이름 또는 직접 입력한 학과 문자열을 전달한다. 반환값은 수정 후 사용자 전체다. 조회는 기존 `lib/auth.js`의 `getCurrentUser`를 재사용한다.

`withdrawAccount(idToken, options)`는 새로 받은 Google ID 토큰을 `{ idToken }` 본문에 담아 `DELETE /users/me`로 전송한다. 성공 204의 반환값은 `undefined`다. 로그인 API를 다시 호출하지 않으며 토큰을 저장하지 않는다. 최신 명세는 토큰 검증 실패·다른 Google 계정에도 401을 반환하므로, 호출부에서 세션 만료와 재인증 실패를 구분해야 한다. 이 함수 자체는 사용자 상태를 변경하거나 화면을 이동하지 않는다.

두 함수의 `options`는 `signal`과 선택적인 `request`를 받는다. 기본 `request`는 기존 `authRequest`이며 `NEXT_PUBLIC_AUTH_MODE=mock|live`로 전환한다. live 모드의 쿠키 인증은 그대로 유지한다. 인증 상태 관리 단계에서 필요에 따라 `authenticatedRequest`를 전달할 수 있으나, 탈퇴에 기존의 모든 401을 로그아웃으로 처리하는 함수를 그대로 연결하지 않는다.

### 브라우저 mock의 범위

- mock 모드에서만 `lib/mock/auth.js`를 동적으로 불러와 `localStorage`의 `sajarok_mock_auth` 한 항목에 mock 회원·로그인·가입 진행 정보를 보관한다. 서버 Route Handler·암호화 키·외부 저장소는 필요하지 않다.
- 로그인·가입·조회·수정·로그아웃·탈퇴는 네트워크 없이 처리한다. mock은 API와 같은 상태 코드·`success/data/error` 형식의 Response를 만들고 기존 공통 Client가 파싱하므로 화면의 응답·오류 처리를 재사용한다.
- 회원 정보는 같은 Preview 주소의 브라우저에서 새로고침·재로그인 후에도 유지된다. 다른 주소·브라우저·시크릿 창과 공유하지 않는다. 로그인 모의 상태는 7일, 가입 진행은 10분간 유효하다.
- Google 인증 UI는 로그인과 탈퇴 모두 `NEXT_PUBLIC_GOOGLE_AUTH_MODE=google|mock`을 따른다. 실제 Google 인증과 localStorage mock도 함께 사용할 수 있다. mock은 Google payload의 계정 식별값으로 동일 계정 여부를 모의 비교하며 서명 검증은 하지 않는다. 실제 Google ID 토큰·백엔드 인증 정보는 localStorage에 저장하지 않는다.
- 탈퇴는 mock 회원·로그인·가입 상태를 지워 이후 신규 가입으로 진입시킨다. 데모 계정 탈퇴 거부는 유지한다. 회고·카드 등 별도 클라이언트 mock 상태는 기존 사용자 상태 변경으로 초기화한다.
- 이 mock은 UI·기능 흐름 검증용이다. 실제 HTTP·Google 검증·HttpOnly 쿠키·CORS·서버 데이터 삭제는 live 모드에서 검증해야 한다.

관련 검증: `node --test lib/mock/auth.test.js lib/profileApi.test.js`

### 화면에서 사용하는 인증 상태 동작

`useAuth()`의 `saveProfile(changes, { signal })`는 수정 API 응답을 검증한 뒤 현재 사용자 정보에 반영하고 갱신된 사용자를 반환한다. 현재 사용자 ID와 다른 응답, 세션 변경 후 도착한 응답, 취소된 요청은 반영하지 않는다. 같은 ID의 정보 갱신은 `MockDataProvider`의 사용자별 기록을 초기화하지 않는다.

`withdraw(idToken, { signal })`는 탈퇴 성공 후 로그인 상태를 정리하고 `/login`으로 이동한다. 탈퇴의 401은 `checkWithdrawalSession`으로 재확인한다. GET 200이면 원래 재인증 오류를 전달하고, GET 401이면 세션 만료로 처리한다. 다른 계정의 세션이면 로컬 상태를 정리한다. 재조회 중 네트워크·서버 오류가 나면 세션을 유지하며 확인 실패를 전달한다. DELETE를 자동 재시도하지 않는다.

`isSavingProfile`, `isWithdrawing`, `isAccountBusy`로 진행 상태를 확인한다. 저장·탈퇴·로그아웃은 동시에 실행하지 않으며 중복 저장·탈퇴는 오류로 거부한다. 헤더 로그아웃은 계정 작업 중 비활성화된다. 입력값, 필드 오류, 저장 성공 토스트와 모달은 화면에서 관리한다.

### 회원 탈퇴 UI

내 정보 화면의 회원 탈퇴는 확인 문구 → Google 본인 확인 → DELETE 순서로 진행한다. Google 로그인 API를 다시 호출하지 않는다. 모달 취소·닫기나 인증 창 취소만으로는 DELETE를 보내지 않는다. 요청 중에는 취소·Esc·배경 클릭으로 모달을 닫지 못하게 하고, 실패 시 오류를 표시한다. 성공 후 로그인 화면 이동과 사용자별 클라이언트 mock 상태 초기화는 기존 인증 상태 처리를 따른다.

계정 유형과 관계없이 로그인한 사용자에게 탈퇴 버튼을 표시한다. 계정 유형을 브라우저 저장소에 기록하거나 유형 확인을 위해 재로그인을 요구하지 않는다. 탈퇴 직전 Google 본인 확인은 유지한다. 데모 계정 탈퇴는 시연 범위에 포함하지 않으며, 기존 mock의 데모 탈퇴 거부 동작은 유지한다. 버튼 표시를 위한 백엔드 구분 필드는 필요하지 않다.


## 7. Vercel Preview에서 Google 없이 테스트하기

Vercel 프로젝트의 **Preview 환경에만** 아래 두 값을 설정하고 재배포한다.

```dotenv
NEXT_PUBLIC_AUTH_MODE=mock
NEXT_PUBLIC_GOOGLE_AUTH_MODE=mock
```

이전 설정인 `MOCK_COOKIE_SECRET`, `MOCK_GOOGLE_REGISTERED`는 더 이상 사용하지 않으므로 `.env.local`이나 Vercel에 등록했다면 삭제해도 된다. 처음에는 일반 로그인 버튼으로 신규 가입하고, 이후 같은 브라우저에서는 기존 회원으로 로그인한다. '데모 계정으로 둘러보기'는 가입 없이 진입하지만 탈퇴 테스트 대상은 아니다.

처음부터 다시 테스트하려면 해당 사이트에서 브라우저 개발자 도구로 `localStorage`의 `sajarok_mock_auth`를 삭제하고 새로고침한다. Preview 주소가 바뀌면 새 주소에는 저장 데이터가 없어 신규 상태로 시작한다.

실제 백엔드 연결 시 `NEXT_PUBLIC_AUTH_MODE=live`, `NEXT_PUBLIC_GOOGLE_AUTH_MODE=google`, 실제 `NEXT_PUBLIC_API_BASE_URL`과 Google Client ID를 설정하고 재빌드한다. live 모드는 mock 모듈이나 localStorage를 사용하지 않고 기존 `apiRequest`의 실제 fetch·`credentials: include`·HttpOnly 세션 쿠키 흐름을 그대로 따른다. 실제 연동 검증은 별도로 필요하다.
