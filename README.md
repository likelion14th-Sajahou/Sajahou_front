# 사자록 · Sajahou Frontend

멋쟁이사자처럼 활동에서 쌓은 경험을 회고하고, 스토리 카드로 모아 포트폴리오와 자기소개서 작성에 활용하는 서비스입니다.

## 주요 기능

| 기능 | 설명 |
| --- | --- |
| 홈 | 이번 주 회고 상태, 활동 스티커 보드, 최근 회고와 프로젝트 확인 |
| 주간 회고 | 세션·과제 자료와 경험을 입력하고, AI 질문에 답하며 회고와 스토리 카드 작성 |
| 프로젝트 | 프로젝트별 활동 기록과 자료를 관리하고, AI 질문을 통해 경험 정리 및 포트폴리오 초안 작성 |
| 나의 사자록 | 주차별 발자국과 스토리 카드 조회·수정·삭제 |
| 자소서 매칭 | 채용 공고와 자기소개서 문항의 역량을 분석하고, 내 스토리 카드를 활용해 답변 초안 생성·수정 |
| 계정 | Google 로그인·회원가입, 프로필 수정 및 회원 탈퇴 |

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| 런타임 | Node.js 24.x |
| 프레임워크 | Next.js 16.4.4 · App Router |
| UI | React 19.3.0 |
| 언어 | JavaScript · JSX |
| 스타일 | Tailwind CSS 4.x |
| 코드 검사 | ESLint 9.x · eslint-config-next |
| 패키지 관리 | npm · package-lock.json |

## 로컬 실행

Node.js 24.x와 npm을 준비한 뒤 프로젝트 루트에서 실행합니다.

```bash
npm ci
```

`.env.example`을 `.env.local`로 복사합니다. PowerShell에서는 다음 명령을 사용합니다.

```powershell
Copy-Item .env.example .env.local
```

macOS·Linux에서는 다음 명령을 사용합니다.

```bash
cp .env.example .env.local
```

아래 환경변수 안내에 따라 실제 백엔드와 Google 로그인 연결을 설정한 후 개발 서버를 시작합니다.

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)에 접속합니다. 환경변수를 변경했다면 개발 서버를 다시 실행합니다.

### 환경변수

| 변수 | 설명 |
| --- | --- |
| `BACKEND_URL` | Next.js 서버가 API 요청을 전달할 백엔드 origin. `/api/v1`을 제외한 주소를 입력합니다. 기본값은 `.env.example`과 `next.config.mjs`를 참고합니다. |
| `NEXT_PUBLIC_AUTH_MODE` | 실제 백엔드를 사용하도록 `live`로 설정합니다. |
| `NEXT_PUBLIC_GOOGLE_AUTH_MODE` | Google Identity Services 인증을 사용하도록 `google`로 설정합니다. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | 실제 Google 로그인에 사용하는 OAuth Client ID |

`.env.example`을 복사한 후 `.env.local`의 연결 설정을 다음과 같이 변경합니다. 아래 주소와 Client ID는 예시이므로 사용하는 서버와 OAuth 클라이언트의 값으로 대체합니다.

```dotenv
BACKEND_URL=https://your-backend.example.com
NEXT_PUBLIC_AUTH_MODE=live
NEXT_PUBLIC_GOOGLE_AUTH_MODE=google
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

백엔드가 실행 중이어야 하며, 사용하는 Google OAuth 클라이언트에 프론트엔드 origin이 허용되어 있어야 합니다.

`NEXT_PUBLIC_` 변수는 브라우저에 공개됩니다. 비밀 키를 넣지 않고, 개인별 설정을 담은 `.env.local`은 커밋하지 않습니다. 배포 환경에서 값을 변경한 경우 다시 빌드·배포합니다.

API 프록시·세션 쿠키·CSRF의 상세 동작은 [API 요청 및 인증 가이드](lib/API_CLIENT.md)를 참고합니다.

## 실행 및 검증 명령어

| 명령어 | 용도 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run lint` | ESLint 검사 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드된 앱 실행. 먼저 `npm run build`를 실행합니다. |

GitHub Actions는 `develop`·`main` 대상 PR과 `develop` 브랜치 push에서 의존성 설치 → 린트 → 빌드 → 번들 크기 검사를 실행합니다.

## 프로젝트 구조

```text
app/
├── (auth)/                 # 로그인·회원가입
├── (main)/                 # 공통 헤더를 사용하는 서비스 화면
│   ├── matching/            # 자소서 매칭
│   ├── my-record/           # 나의 사자록
│   ├── projects/            # 프로젝트 목록·상세
│   └── retrospective/       # 주간 회고
├── fonts/                  # 로컬 폰트와 라이선스
├── fonts.js                # 폰트 등록
├── globals.css             # 전역 스타일·Tailwind 디자인 토큰
└── layout.js               # 루트 레이아웃·공유 Provider
components/                 # 기능별 컴포넌트·공통 UI·Provider
lib/                        # API 요청·화면 데이터 변환·공통 로직
public/images/              # 로고·캐릭터·스티커 이미지
scripts/                    # 번들 크기 검사
.github/                    # CI·Issue·PR 템플릿
```

`(auth)`와 `(main)`은 레이아웃을 구분하는 Route Group이며 실제 URL에는 포함되지 않습니다. 화면 주소는 `/login`, `/signup`, `/`, `/retrospective`, `/projects`, `/projects/[id]`, `/my-record`, `/matching`입니다.

## 개발 및 협업

### 개발 원칙

- JavaScript·JSX와 기존 App Router 구조를 사용합니다.
- Server Component를 기본으로 사용하고, 상태·이벤트·브라우저 API가 필요한 범위에만 Client Component를 적용합니다.
- 공통 UI는 `components/ui/`, 디자인 토큰은 `app/globals.css`의 `@theme`에서 관리합니다.
- 반복되는 UI와 로직은 재사용하되 불필요한 추상화와 의존성 추가를 피합니다.
- 모바일·태블릿·데스크톱 레이아웃과 로딩·실패·빈 데이터 상태를 함께 고려합니다.
- API는 확인된 명세와 응답을 기준으로 연동하고, 인증 정보의 저장·전달은 백엔드와 합의한 정책을 따릅니다.
- 새 의존성, 주요 구조·설정, 인증 정책, API 계약 및 호환성을 깨는 변경은 사전에 합의합니다.

### 브랜치 전략 및 이름

- `main`: 최종 안정화 및 배포
- `develop`: 기능 통합 및 테스트
- 작업 브랜치는 최신 `develop`에서 분기하고, 작업 완료 후 `develop`을 대상으로 PR을 작성합니다. 최종 검증 후 `develop`을 `main`에 병합합니다.

브랜치명은 `접두사/#이슈번호-내용` 형식으로 작성합니다. 영어 소문자와 `kebab-case`를 사용하고, 이슈 번호가 없으면 번호를 생략합니다.

| 작업 | 접두사 | 예시 |
| --- | --- | --- |
| 기능 개발 | `feature/` | `feature/#164-chat-header` |
| 버그 수정 | `fix/` | `fix/header-overflow` |
| 문서 | `docs/` | `docs/readme-update` |
| 리팩토링 | `refactor/` | `refactor/api-client` |
| 디자인 | `design/` | `design/login-page` |
| 환경 설정·협업 | `chore/` | `chore/pr-template` |

### 커밋 및 Pull Request

- 커밋 메시지는 `태그: 내용` 형식으로 작성합니다. 예: `docs: README 작성`
- 태그는 `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `design`을 사용합니다.
- 디자인 변경은 `design`, 동작 변화 없는 포맷 정리는 `style`을 사용합니다.
- PR 제목은 `[TAG] 작업 내용` 형식으로 커밋 태그를 대문자로 표기합니다. 예: `[DOCS] README 작성`
- Issue와 PR은 저장소의 템플릿을 따르고, 관련 이슈·실제 변경 내용·재현 가능한 테스트 방법을 작성합니다.
- 코드 변경 후 `npm run lint`를 실행하고, 가능하면 `npm run build`로 빌드를 확인합니다. 실행하지 못한 검사와 남은 문제는 PR에 명시합니다.
- AI 활용 시 브랜치 변경·커밋·push 등 Git 상태를 변경하는 작업과 Issue·PR 생성 및 병합은 작업자가 직접 수행합니다.

## 관련 문서

- [API 요청 및 인증 가이드](lib/API_CLIENT.md)
- [폰트 출처 및 라이선스](app/fonts/LICENSE.md)
- [Issue 템플릿](.github/ISSUE_TEMPLATE.md)
- [Pull Request 템플릿](.github/PULL_REQUEST_TEMPLATE.md)
