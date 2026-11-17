# API 요청 및 인증 가이드

공통 HTTP 처리는 `apiClient.js`, 세션 쿠키와 CSRF 처리는 `auth.js`, 화면의 인증 상태는 `components/layout/AuthProvider.js`에서 관리합니다. 이 문서는 현재 프론트엔드 구현을 설명하며, 요청·응답 계약을 변경하는 API 명세를 대신하지 않습니다.

## 요청 흐름과 관련 파일

```text
화면 → 도메인 API 함수 → authenticatedRequest → authRequest
     → apiRequest → /api/v1 → Next.js rewrite → 백엔드
```

로그인·가입·최초 사용자 조회는 세션이 아직 없을 수 있으므로 `authenticatedRequest`를 거치지 않고 전용 인증 함수를 사용합니다.

| 파일 | 담당 범위 |
| --- | --- |
| `apiClient.js` | 공통 HTTP 요청과 응답 처리 |
| `auth.js` | Google 로그인·가입·사용자 조회·로그아웃, CSRF |
| `components/layout/AuthProvider.js` | 세션 복원·사용자 상태·401 처리·계정 작업 |
| `homeApi.js` | 홈 데이터 |
| `retrospectiveApi.js` | 회고·질문·초안·완료 |
| `myRecordApi.js` | 역량·발자국·스토리 카드 |
| `projectApi.js` | 프로젝트·기록·포트폴리오 |
| `matchingApi.js` | 공고 분석·자소서 답변 |
| `attachmentApi.js` | 파일·링크 첨부와 읽기 상태 |
| `profileApi.js` | 프로필 수정·회원 탈퇴·탈퇴 후 세션 확인 |
| `requestErrorMessage.js` | 일반 요청·AI 실패의 사용자 안내 문구 |

## 연결 설정

환경변수는 [README](../README.md#환경변수)를 참고합니다.

- 브라우저의 기본 요청 주소는 현재 프론트엔드 origin의 `/api/v1`입니다. `next.config.mjs`의 rewrite가 `BACKEND_URL`로 전달합니다.
- 호출 경로는 `/users/me`처럼 `/api/v1` 이후 부분만 전달합니다. 동적 ID는 도메인 API 함수에서 `encodeURIComponent`로 인코딩합니다.
- `baseUrl` 옵션은 기본 주소보다 우선하며 origin 또는 `/api/v1`까지 포함한 절대 URL을 받습니다.
- 브라우저에서는 `NEXT_PUBLIC_API_BASE_URL`을 사용하지 않습니다. 서버에서는 이 값을 fallback으로 지원하지만, 새 서버 호출에는 `baseUrl: process.env.BACKEND_URL`처럼 주소를 명시합니다. URL을 결정할 수 없으면 TypeError가 발생합니다.
- 서버에서 `apiRequest`를 사용할 때는 절대 `baseUrl`과 현재 사용자의 쿠키 헤더를 명시합니다. 서버의 `credentials: "include"`는 사용자 쿠키를 자동 전달하지 않습니다.
- `authRequest`는 브라우저 세션의 CSRF 상태를 공유하므로 서버 인증 호출에 그대로 사용하지 않습니다.

## 요청 함수의 역할

| 계층 | 역할 |
| --- | --- |
| `apiRequest` | URL·query·body 구성, 응답 파싱, 타임아웃·취소, 오류 변환 |
| `authRequest` | 세션 쿠키를 사용하는 요청에 CSRF 처리 추가 |
| `authenticatedRequest` | AuthProvider가 제공하는 요청 함수. 현재 세션의 401 처리와 세션 변경 보호 적용 |
| `*Api.js` | 도메인별 경로·메서드·요청 필드·타임아웃 정의 |

화면에서는 도메인 API 함수를 사용하고, 해당 함수가 지원하는 `request` 옵션으로 `useAuth().authenticatedRequest`를 전달합니다. 로그인·회원가입·탈퇴처럼 401의 의미가 다른 요청은 전용 흐름을 따릅니다.

### 옵션과 반환값

| 옵션 | 동작 |
| --- | --- |
| `method` | 기본 `GET` |
| `query` | 객체 또는 URLSearchParams. 객체의 null·undefined는 생략하고 배열은 같은 키를 반복 |
| `body` | JSON 값 또는 FormData. JSON은 자동 직렬화 |
| `headers` | 요청별 헤더. 기본 `Accept`는 `application/json` |
| `timeoutMs` | 1~2147483647의 정수(ms). 생략하면 공통 Client 자체 제한 없음 |
| `signal` | 호출부 AbortController의 signal |
| `baseUrl` | 요청별 절대 API 주소 |
| `fetcher` | 기본 `fetch`. 별도 transport가 필요한 경우 지정 |
| 기타 | `cache`, `next` 등 fetch 옵션 전달 |

`credentials`는 항상 `include`이며 호출부에서 덮어쓸 수 없습니다. JSON body에는 기본 `Content-Type: application/json`을 설정하고, 요청별 Content-Type이 있으면 유지합니다. FormData는 Content-Type을 제거하여 런타임이 boundary를 지정하게 합니다. GET·HEAD에는 body 대신 query를 사용합니다.

- JSON body는 `JSON.stringify`하지 않고 값 그대로 전달합니다. 문자열을 전달하면 JSON 문자열로 직렬화됩니다. 파일은 FormData로 전달합니다.
- query 객체의 `0`·`false`는 유지합니다. URLSearchParams는 담긴 값을 그대로 추가하며, 배열 지원 여부는 각 API 계약을 확인합니다.
- `apiRequest`는 캐시 정책을 일괄 지정하지 않습니다. 현재 `authRequest`의 전송 경로는 `cache: "no-store"`를 적용합니다.

성공 응답 `{ success: true, data, error }`에서 **data만 반환**합니다. 배열·null·false도 유지하며 반환값에 다시 `.data`나 `.json()`을 호출하지 않습니다. 204·HEAD 및 본문 없는 성공 응답은 `undefined`입니다.

HTTP 실패는 본문이 HTML이거나 비어 있어도 HTTP 오류로 처리합니다. HTTP 성공이어도 `success: false`이면 실패입니다. 성공한 비어 있지 않은 JSON은 `success: true`와 `data` 필드를 모두 가져야 합니다. `error: null` 여부만으로 성공을 판단하지 않습니다.

## 세션 쿠키와 CSRF

- 브라우저가 HttpOnly 세션 쿠키를 저장·전송합니다. 인증용 Bearer 토큰 생성이나 localStorage 토큰 저장을 추가하지 않습니다.
- `authRequest`는 GET·HEAD 이외의 요청 전에 `GET /auth/csrf`로 토큰을 받습니다. 응답의 `headerName`과 `token`을 요청 헤더에 사용합니다.
- 동시에 시작한 요청은 CSRF 조회를 공유합니다. 토큰은 재사용하고 로그아웃·탈퇴·401 뒤에는 초기화합니다.
- 403 `CSRF_INVALID`이면 토큰을 갱신해 한 번 재시도합니다. 다른 403에는 이 재시도를 적용하지 않습니다.
- 로딩·빈 상태·알림·화면 이동은 호출부에서 처리합니다.

## 로그인과 세션 복원

1. Google SDK가 반환한 ID 토큰을 `loginWithGoogle`로 전달합니다. 이 토큰은 백엔드 로그인 요청에 사용하며 저장하지 않습니다.
2. `registered: true` 응답이면 `completeLogin`이 `/users/me`를 조회·검증하여 사용자 상태를 설정합니다.
3. `registered: false` 응답이면 가입용 토큰·이메일을 AuthProvider 메모리에 보관하고 `/signup`으로 이동합니다. 프론트엔드의 가입 진행 유효기간은 10분입니다.
4. 가입 요청은 `signupWithGoogle`을 사용합니다. 가입 완료 후에도 사용자 조회 결과로 로그인 상태를 확정합니다.
5. 새로고침하면 `/users/me`로 세션을 복원합니다. 개발 중 Strict Mode의 effect 재실행에서도 진행 중인 최초 조회를 공유합니다.

세션 복원의 `restoreStatus`는 `checking`, `ready`, `error`입니다. 복원 중 401은 비로그인 상태로 처리하고, 네트워크·서버 오류는 복원 실패 상태와 재시도 UI로 처리합니다.

`authenticatedRequest`는 로그인 상태가 없으면 요청을 보내지 않습니다. 현재 세션 요청의 401은 사용자 상태를 정리하고 `/login`으로 이동합니다. 취소된 요청이나 로그인 상태가 바뀌기 전에 시작한 요청의 지연 401은 현재 세션을 해제하지 않습니다. 성공 응답이라도 요청 도중 세션이 바뀌었다면 `AbortError`로 전달하여 이전 계정 데이터를 반영하지 않게 합니다.

로그아웃은 `logout`을 통해 실행합니다. 성공·401이면 로그인 상태를 정리하고, 다른 오류이면 로그인 상태를 유지하며 실패를 안내합니다.

## 사용 예시

아래는 브라우저 요청 예시입니다. 인증된 화면에서는 도메인 API 함수와 `authenticatedRequest`를 우선 사용합니다.

### 화면에서 도메인 API 사용

```js
import { getStoryCards } from "@/lib/myRecordApi";
import { getRequestErrorMessage } from "@/lib/requestErrorMessage";

// authenticatedRequest는 컴포넌트의 useAuth()에서 가져옵니다.
// controller는 해당 로딩 작업의 시작·취소 수명에 맞춰 관리합니다.
const controller = new AbortController();
try {
  const result = await getStoryCards({ type: "SESSION" }, {
    request: authenticatedRequest,
    signal: controller.signal,
  });
  // result로 화면 상태를 갱신합니다.
} catch (error) {
  if (!controller.signal.aborted && error.name !== "AbortError" && error.status !== 401) {
    const message = getRequestErrorMessage(error, "스토리 카드를 불러오지 못했어요.");
    // message를 화면에 표시합니다. AI 요청에는 getAiErrorMessage를 사용합니다.
  }
}
```

### 공통 인증 요청 직접 사용

```js
import { authRequest } from "@/lib/auth";

const user = await authRequest("/users/me", { timeoutMs: 15000 });
const cards = await authRequest("/story-cards", {
  query: { type: "SESSION", weekNumber: 9 },
  timeoutMs: 15000,
});
```

파일 업로드는 `attachmentApi.js`를 사용하고 Content-Type을 직접 설정하지 않습니다.

```js
import { createFileAttachment } from "@/lib/attachmentApi";

// file과 authenticatedRequest는 호출부에서 전달합니다.
const attachment = await createFileAttachment(file, "OUTPUT", {
  request: authenticatedRequest,
});
```

### 타임아웃과 취소

일반 도메인 요청은 주로 15000ms, AI 요청은 65000ms를 사용합니다. 공통 Client가 경로에 따라 자동 지정하지 않으므로 도메인 API 함수에서 설정합니다.

`signal`을 전달하면 화면 이탈이나 사용자 취소 시 요청을 중단할 수 있습니다. 제한 시간은 응답 본문 수신까지 적용합니다. 브라우저 요청 취소가 서버 작업 중단을 보장하지 않으므로 변경 요청을 무조건 재실행하지 않습니다.

외부 취소와 제한 시간 중 먼저 발생한 signal의 원인을 기준으로 `aborted`와 `timeout`을 구분합니다. 타이머는 요청 종료 시 정리합니다. 공통 Client에는 일반적인 자동 재시도 기능이 없습니다. 프로젝트의 첨부 처리 지연 재시도처럼 도메인에 정해진 동작은 해당 API 함수에서 처리합니다.

## 오류 처리

공통 Client는 HTTP·응답·네트워크 오류를 `ApiError` 형태로 전달합니다. 이 클래스는 현재 export하지 않으므로 호출부에서 import하거나 `instanceof ApiError`로 검사하지 않습니다.

| `kind` | 의미 | 서버 코드가 없을 때의 코드 |
| --- | --- | --- |
| `http` | HTTP 실패 | `HTTP_ERROR` |
| `business` | HTTP 성공이지만 `success: false` | `BUSINESS_ERROR` |
| `parse` | 성공 응답 JSON 파싱 실패 | `INVALID_JSON` |
| `response` | 성공 응답의 공통 형식 불일치 | `INVALID_RESPONSE` |
| `network` | 네트워크 또는 응답 본문 수신 실패 | `NETWORK_ERROR` |
| `timeout` | Client 제한 시간 초과 | `TIMEOUT` |
| `aborted` | 외부 signal로 취소 | `ABORTED` |

서버의 오류 코드와 메시지가 있으면 보존합니다. 서버의 HTTP 504 `AI_TIMEOUT`과 Client의 `TIMEOUT`은 구분합니다. 요청 준비 중 잘못된 주소·옵션은 TypeError나 RangeError로 전달될 수 있습니다.

오류에는 `status`, `code`, `message`, `fields`, `detail`, `isValidationError`, `payload`, `rawBody`, `cause` 등이 포함됩니다. `isValidationError`는 코드가 `VALIDATION_ERROR`인지로 판단합니다. 응답에 개인정보가 있을 수 있으므로 오류 객체 전체를 외부 로그에 기록하지 않습니다.

- `status`는 응답 수신 전 실패하면 null입니다. 본문 수신 중 실패한 경우에는 HTTP 상태가 있어도 `network`·`timeout`·`aborted`일 수 있습니다.
- HTTP 400 자체를 필드 검증 오류로 간주하지 않습니다. `VALIDATION_ERROR`일 때 `fields`를 사용합니다.
- `getRequestErrorMessage`는 연결 오류와 일반 실패를 구분하고 `DEADLINE_PASSED`를 회고 마감 안내로 바꿉니다.
- `getAiErrorMessage`는 `AI_TIMEOUT`, `AI_FAILED`, `AI_IN_PROGRESS`, `ATTACHMENT_PENDING`의 안내를 제공합니다.
- `authenticatedRequest`의 세션 변경은 DOMException의 `AbortError`로도 전달됩니다. 화면은 `signal.aborted`, `error.name`, 401 처리 여부를 확인한 뒤 필요한 오류만 표시합니다.

## 프로필 수정과 회원 탈퇴

| 함수 | 요청 | 처리 |
| --- | --- | --- |
| `getCurrentUser` | `GET /users/me` | 현재 사용자 조회 |
| `updateProfile` | `PATCH /users/me` | 변경한 `name`, `studentNo`, `department`, `cohort`만 전송 |
| `withdrawAccount` | `DELETE /users/me` | 새 Google ID 토큰을 `{ idToken }`으로 전송 |
| `checkWithdrawalSession` | `GET /users/me` | 탈퇴 401 이후 세션 재확인 |

화면에서는 `useAuth()`의 `saveProfile`과 `withdraw`를 사용합니다. 프로필 저장은 응답의 사용자와 현재 세션을 확인한 뒤 상태에 반영합니다. `isSavingProfile`, `isWithdrawing`, `isAccountBusy`로 중복 동작을 제어합니다.

탈퇴는 확인 문구 → Google 본인 확인 → DELETE 순서입니다. 로그인 API를 다시 호출하거나 토큰을 저장하지 않습니다. 탈퇴 요청에는 모든 401을 세션 만료로 처리하는 `authenticatedRequest`를 그대로 연결하지 않습니다.

탈퇴의 401 이후 사용자 재조회가 200이면 본인 확인 오류로 전달하고, 401이면 세션 만료로 처리합니다. 다른 사용자 세션이면 로컬 상태를 정리하며, 네트워크·서버 오류이면 세션을 유지하고 확인 실패를 안내합니다. DELETE는 자동 재시도하지 않습니다.

## 배포 및 연동 확인

1. 대상 배포 환경에 백엔드 주소와 Google Client ID를 설정하고 재빌드·배포합니다.
2. OAuth 클라이언트에 프론트엔드 origin을 승인된 JavaScript 원본으로 등록합니다. 로그인은 popup/callback 방식입니다.
3. `/api/v1/auth/csrf` 응답, Google 로그인, `/api/v1/users/me` 조회를 확인합니다.
4. 쿠키 저장·새로고침 후 세션 복원·변경 요청·로그아웃을 확인합니다. 쿠키 문제는 Set-Cookie와 브라우저 차단 사유를 확인합니다.
5. 첨부 처리와 AI 성공·실패·지연 응답은 실제 백엔드에서 확인합니다.

### 문제를 확인할 때

| 증상 | 확인할 내용 |
| --- | --- |
| 응답이 HTML이거나 프록시 요청 실패 | 요청 URL·HTTP 상태·응답 본문, `BACKEND_URL`·rewrite 대상 |
| 로그인 후에도 401 | Set-Cookie, 브라우저의 쿠키 차단 사유, Domain·Path·Secure·SameSite, 사용자 조회 응답 |
| 변경 요청만 403 | CSRF 조회 결과와 실제 요청 헤더, `CSRF_INVALID` 여부 |
| 요청이 오래 걸림 | Client의 `kind: timeout`인지 서버의 `AI_TIMEOUT`인지 구분 |
| 화면 이탈 후 오류 안내 | AbortController 취소와 `AbortError` 처리 여부 |

위 항목은 점검 절차이며 실제 백엔드·배포 환경의 검증 완료를 의미하지 않습니다.
