# DisplayU Frontend AI 작업 규칙

> 팀 공용 AI 작업 규칙이다. Codex는 이 파일을, Claude Code는 `CLAUDE.md`(`@AGENTS.md`)를 통해 이 파일을 읽는다.
> 규칙을 바꿀 때는 PR로 팀 리뷰를 받는다.

## 프로젝트 맥락

- React 18 + TypeScript + Vite 기반 **반응형 웹**(모바일 · 태블릿 · 데스크톱) 프론트엔드다. 패키지 매니저는 `pnpm`.
- 라우팅: `react-router-dom` v7, 라우트 정의는 `src/Router.tsx`.
- 스타일: Tailwind CSS v4. 클래스 조합은 `cn()`(`src/utils/cn.ts`)을 사용한다. 토큰 규칙은 아래 "스타일 (디자인 토큰)"을 따른다.
- import 경로는 `@/` 별칭(`src/*`)을 사용한다.
- 팀 협업 규칙(커밋·브랜치·네이밍·export)은 `CONVENTION.md`를 따른다. commitlint, husky, ESLint가 강제하므로 우회하지 않는다.
- 팀 코드 리뷰 기준은 `.coderabbit.yaml`의 `path_instructions`에 있다. 대부분 이 파일과 같은 내용이고, React 리뷰 관점(의존성 배열, cleanup, key, race condition 등)이 필요할 때 참고한다.
- 권한 매트릭스(리소스 × 액션 × 역할)는 `docs/README.md`(GitBook)에 있다.
- 반응형 · 인터랙션 정책(브레이크포인트, 컨테이너, safe area, 터치 영역, 모션, 오버레이 등)은 `docs/ui-policy.md`(GitBook)에 있다. UI를 만들거나 고칠 때 먼저 읽고, 문서에 없는 세부 사항은 [프로토타입](https://displayu-demo.vercel.app/)을 따른다.

### 환경 변수

- `.env.*`는 gitignore 대상이다. `VITE_` 값은 빌드 결과에 그대로 노출되므로 비밀 키를 넣지 않는다.
- 개발 서버는 `/v1`, `/auth` 요청을 `https://api.displayu.co.kr/api`로 프록시한다(`vite.config.ts`).

## 폴더 역할

- `src/api/endpoints`: API 호출 함수 / `src/api/dto`: 요청·응답 타입
- `src/api/queryKeys.ts`: Query key 정의(규칙은 아래 "React Query")
- `src/hooks/queries`: React Query 훅 / `src/hooks`: 일반 커스텀 훅
- `src/stores`: zustand 상태(클라이언트 상태만)
- `src/permissions`, `src/policies`, `src/components/guards`: 권한·접근 제어
- `src/components/ui`, `src/components/common`: 공통 컴포넌트
- `src/components/<기능명>`: 기능별 컴포넌트 / `src/pages`: 라우트 페이지
- `src/contexts`: 등록 플로우의 draft 상태 등 화면 흐름 Context
- `src/mocks`: MSW 핸들러와 목 데이터
- PR 라벨러(`.github/labeler.yml`)가 경로로 라벨을 붙이므로 파일 위치를 임의로 바꾸지 않는다.

## 코드 작성 방식

- 새로 만들기 전에 `components/ui`, `components/common`, `hooks`, `utils`에 재사용 가능한 것이 있는지 먼저 확인한다. 이미지, 로딩·에러·빈 상태 화면, 모달·바텀시트, 이탈 확인처럼 화면마다 반복되는 UI는 특히 공용 컴포넌트가 있는지 찾아본다.
- 모듈화를 지키도록 노력한다.
  - 한 파일·컴포넌트가 여러 역할을 맡지 않게 한다. 데이터 로직은 훅, 순수 계산은 `utils`, 반복되는 UI는 컴포넌트로 분리한다.
  - 분리한 모듈은 폴더 역할에 맞는 위치에 두고 barrel(`index.ts`)로 내보낸다.
  - 한 곳에서만 쓰는 작은 코드를 미리 과하게 쪼개지는 않는다.
- 응집성을 높게 유지한다.
  - 함께 바뀌는 코드는 함께 둔다. 특정 기능에서만 쓰는 컴포넌트·상수·타입·스키마는 그 기능 폴더(`components/<기능명>`, `pages/<기능명>`) 가까이에 둔다.
  - 여러 기능에서 실제로 재사용될 때만 `components/common`, `hooks`, `utils`, `constants` 같은 공용 위치로 올린다.
  - 한 모듈 안의 코드는 하나의 목적을 위해 존재하게 하고, 관련 없는 로직을 한 파일에 섞지 않는다.
- 모듈 경계를 지킨다.
  - 기능 폴더(`components/<기능명>`)끼리 서로의 내부 파일을 직접 import하지 않는다. 함께 쓰게 되면 공용 위치로 올린다.
  - 공용 컴포넌트(`components/ui`, `components/common`)는 API·Query 훅에 의존하지 않고 props로 데이터를 받는다.
- 서버 상태는 React Query, 클라이언트 상태는 zustand로 관리한다. 사용자 정보·권한은 Query 캐시를 기준으로 한다(#374).
- 폼은 `react-hook-form` + `zod` 스키마(`*.schema.ts`)를 사용한다. 검증 메시지는 한국어로 쓴다.
- API 오류는 `ApiError`(`src/api/apiError.ts`)와 `getErrorMessage`(`src/utils/error.ts`)를 사용해 처리한다.
- 명시적인 리디자인 요청이 없으면 기존 레이아웃·컴포넌트 패턴을 따른다. 간격 값·색상·타이포는 아래 "스타일 (디자인 토큰)"을 따른다.
- 화면에 보이는 문구는 한국어로 작성한다.
- 백엔드 API가 준비되지 않은 기능은 `src/mocks`에 핸들러를 추가하고 `VITE_ENABLE_MOCK=true`로 확인한다.
- 새 라이브러리는 기존 의존성이나 브라우저 기본 기능으로 대체할 수 없을 때만 제안하고, 추가 전에 먼저 묻는다.

### API 계층

- 데이터 흐름: `pages` → `components` → `hooks/queries` → `api/endpoints` → `apiRequest`(`src/api/client.ts`) → `axiosInstance`.
- 화면·컴포넌트에서 `axios`·`axiosInstance`를 직접 호출하지 않는다.
- endpoint 함수는 `apiRequest`를 사용하고, 위에 `// METHOD /path` 주석을 단다(기존 파일 형식). 필요하면 `signal`을 받을 수 있게 한다.
- DTO 이름은 `XxxRequestDto` / `XxxResponseDataDto` / `XxxDto` 형식을 따르고, `dto/index.ts`·`endpoints/index.ts` barrel에 등록한다.
- `apiRequest`는 `success.data`만 돌려준다. 2xx지만 `resultType: 'FAIL'`인 응답은 인터셉터가 `ApiError`로 바꾸므로 화면에서 다시 검사하지 않는다.
- 화면에서 DTO 가공이 필요하면 훅이나 유틸에서 변환한다.

### React Query

- 새 key는 `queryKeys.ts`에서 도메인 `all` key로부터 파생해, 상위 key 하나로 invalidate할 수 있게 한다. 사용처에서 `[...queryKeys.x.detail(id), 'feelings']`처럼 확장하는 것은 괜찮고, `['foo', id]`처럼 처음부터 문자열로 만든 key는 쓰지 않는다.
- id 등 필요한 값이 없을 수 있으면 `enabled`로 막는다. 로그인 전용 쿼리는 `accessToken` 존재를 `enabled` 조건에 넣는다(`useUserMe` 참고).
- mutation 후 관련 목록·상세 key를 함께 invalidate한다. 낙관적 업데이트를 하면 실패 시 롤백한다.
- 요청 중에는 제출 버튼을 비활성화해 중복 제출을 막는다.
- 로그인·로그아웃 시 캐시 초기화는 `queryClient.ts`가 `sessionVersion` 변경을 구독해 처리한다. 호출부에서 `queryClient.clear()`를 따로 넣지 않는다.
- 기본 retry 정책은 `queryClient.ts`에 있다. 훅마다 다시 정의하지 않는다.

### 인증·세션 (민감 영역)

- `src/api/axios.ts`, `src/stores/authStore.ts`, `src/queryClient.ts`는 서로 의존한다. 수정 전에 세 파일을 함께 읽고, 변경 이유를 먼저 설명한다.
- `setAccessToken`(로그인, 세션 버전 증가)과 `refreshAccessToken`(같은 세션 갱신, 버전 유지)을 구분해서 쓴다.
- 요청 도중 세션이 바뀌면 `SessionChangedError`로 응답을 버린다. 이 오류는 사용자 에러로 표시하지 않는다.
- 로그인 후 이동은 `pendingRedirect` 유틸을 사용하고, 외부 URL로 이동하지 않게 한다(open redirect 방지).

### 권한

- 권한 판단을 화면에서 조건문으로 직접 만들지 않는다. `src/policies/policies.ts` + `usePolicy` 훅(`src/hooks/usePolicy.ts`)으로 권한 객체를 만들고, 화면에서는 `hasPermission`(`src/utils/hasPermission.ts`)으로 확인한다.
- 보호가 필요한 라우트는 `AuthGuard`, `RoutePermissionGuards`로 감싼다. 버튼 숨김만으로 권한 처리를 끝내지 않는다.
- 정책을 바꾸면 `docs/README.md` 매트릭스와 일치하는지 확인하고, `permissions.spec.ts` 스냅샷이 바뀐 이유를 답변과 PR 본문에 명시한다. 스냅샷을 무작정 `-u`로 갱신하지 않는다.

### 스타일 (디자인 토큰)

새 토큰은 `src/styles/tokens/`(피그마 기준), legacy 토큰은 `src/styles/legacy/`(기존 화면용, 삭제 예정)에 있다. 쓰기 전에 항상 현재 정의를 읽고 실제로 있는 이름만 쓴다.

- 새 코드는 새 토큰만 쓴다. legacy 클래스·변수, hex·`text-[14px]`·`p-[16px]` 같은 임의값을 쓰지 않는다(`1px` 구분선, 레이아웃 고정 크기는 예외). 간격은 Tailwind 기본 스케일을 쓴다. legacy 토큰을 쓰는 기존 공용 컴포넌트를 재사용하는 것은 괜찮다.
- legacy는 수정하지 않는다.
- 필요한 새 토큰이 없으면 legacy에서 같은 역할의 값을 **복사해** 새 토큰으로 추가한다(`var()`로 legacy를 참조하지 않는다). 이름은 새 토큰 규칙을 따른다. legacy에도 없으면 사용자에게 묻는다.
- 새 토큰과 이름이 같은 legacy 토큰이 생기면 legacy 쪽을 삭제한다. 값이 다르면 그 이름을 쓰던 기존 화면 모양이 바뀌므로, 영향이 크면 삭제 전에 사용자에게 묻는다.
- legacy 토큰을 삭제하면 더 이상 정의되지 않는데 아직 사용처가 남는 클래스·변수가 생기는 경우, 절대 임의로 판단해서 처리하지 말고 개발자에게 묻는다.
- 토큰을 추가·삭제했으면 작업 완료 답변에 알린다. 삭제한 PR에는 "🗑️ 삭제한 legacy 토큰" 섹션에 "기존 화면이 달라질 수 있다"는 경고와 토큰(전 값 → 새 값)·영향받는 화면을 적는다.

### 컴포넌트·UI

- 새 페이지는 named export로 만들고 `Router.tsx`의 `lazyPage(() => import(...), 'ExportName')`로 등록한다.
- 클릭 요소는 `div onClick` 대신 `button`·`Link`를 쓰고, 아이콘 버튼에는 `aria-label`, 이미지에는 `alt`를 단다.
- props·Query 데이터로 계산 가능한 값을 `useState`에 복사하거나 `useEffect`로 동기화하지 않는다.
- `target="_blank"`에는 `rel="noopener noreferrer"`, `dangerouslySetInnerHTML`은 sanitize 후에만 사용한다.
- 토큰·이메일·위치 등 민감 정보를 `console.log`에 남기지 않는다(`no-console` 경고 대상).
- `src/styles/index.css`의 input `font-size: 16px` 규칙은 iOS Safari 입력 확대 방지용이다. 한 번 삭제했다가 되돌린 이력(#352 revert)이 있으니 지우지 않는다.

### 반응형 · 인터랙션 공용 코드

정책은 `docs/ui-policy.md`가 기준이다. 새 페이지는 아래 공용 코드를 쓰고, 같은 기능을 화면에서 따로 만들지 않는다.

- 토큰(정의: `src/styles/tokens/semantic.css`, `theme.css`)
  - 브레이크포인트: `tablet:`(768px~), `desktop:`(900px~). 768~899px는 데스크톱 레이아웃을 따르므로 레이아웃 전환은 `tablet:`에서 하고, `desktop:`은 여백·열 수 조정에만 쓴다. Tailwind 기본 `sm:`·`md:`·`lg:`는 새 코드에서 쓰지 않는다.
  - 여백·폭: `px-gutter`(20 → 32 → 40px 자동), `max-w-form`(672px), `max-w-list`(1160px)
  - safe area: 헤더 `pt-safe-area-top`, 하단 고정 요소 `pb-safe-area-bottom`. legacy `pb-safe-bottom`은 새 코드에서 쓰지 않는다.
  - 냅바·키보드: `pb-navbar-clearance`(냅바에 가리지 않게), `bottom-keyboard-inset`(키보드 위에 붙이기)
  - 오버레이 뒤 배경: `bg-dim`. 포커스 테두리: `focus-visible:outline-2 focus-visible:outline-focus`(어두운 배경 위에서는 `outline-focus-inverse`)
  - 모션: `duration-fast`(200) · `duration-base`(300) · `duration-slow`(450), `ease-standard`. 애니메이션은 `animate-fade-*`, `animate-sheet-*`, `animate-modal-*`, `animate-toast-*`, `animate-rise`. 동작 줄이기는 `index.css` 전역 규칙이 처리하므로 컴포넌트에서 따로 막지 않는다.
  - `theme.css`에 토큰을 추가하면 `src/utils/cn.ts`의 tailwind-merge 설정에도 추가한다(안 하면 `cn()` 덮어쓰기가 동작하지 않는다).
- 페이지 틀: `PageContainer`(`@/components/layout`). 입력 화면(등록·수정)은 `variant="form"`, 목록·관리 화면은 `variant="list"`. 홈은 프로토타입을 따라 직접 만든다.
- 스크롤: 새 페이지는 window 스크롤을 쓴다. 페이지 전체를 `h-dvh overflow-y-auto`로 감싸지 않는다(스크롤 복원·키보드 보정이 동작하지 않는다). 새 페이지 이동은 최상단, 뒤로가기는 위치 복원을 `RootLayout`의 `<ScrollRestoration />`이 처리한다.
- 라우트 구조: `RootLayout`(모든 라우트 공통: 스크롤 복원, 토스트, 오버레이 기록 정리, 키보드 추적) 안에 `Layout`(냅바·푸터)이 있다. 냅바가 필요 없는 화면은 `Layout` 밖, `RootLayout` 안에 둔다.
- 탭·필터·정렬을 URL에 둘 때는 `useReplaceSearchParams`(`@/hooks/useReplaceSearchParams`)를 쓴다. 뒤로가기 단계를 쌓지 않고 스크롤을 유지한다.
- 하단 고정 버튼: 본문 흐름 안 sticky 버튼은 `BottomButton inPageContainer`, 화면 하단 고정 바는 `BottomFixedBar container="form" | "list"`. 둘 다 safe area와 iOS 키보드를 처리한다. 직접 만드는 하단 고정 요소는 `fixed bottom-keyboard-inset`을 쓰고 `useBottomObstruction(ref)`(`@/hooks/useVirtualKeyboard`)로 등록한다.
- 오버레이: `Overlay`(`@/components/ui`). 768px 미만 바텀시트, 이상 가운데 모달로 자동 전환되고, 스크롤 잠금과 배경 탭·ESC·뒤로가기 닫기를 처리한다.
  - `open` prop으로만 열고 닫는다. `{open && <Overlay … />}`처럼 조건부로 렌더링하지 않는다(닫힘 애니메이션이 사라진다).
  - 오버레이 안에서 다른 페이지로 이동할 때는 `replace`로 이동한다.
  - 오버레이는 열릴 때 같은 URL로 history 기록을 쌓아 `location.key`·`location.state`가 바뀐다. 상태 초기화는 `pathname` 기준으로 한다.
  - 기존 `BottomSheet`·`ConfirmModal`·`AlertModal`은 legacy 화면용이다. 새 화면에서는 쓰지 않는다.
- 로딩
  - React Query `isPending`(아직 데이터 없음)일 때만 스켈레톤을 띄운다. `isFetching`(다시 불러오는 중)일 때는 기존 데이터를 그대로 둔다.
  - 스켈레톤은 카드 단위로, 실제 목록과 같은 그리드 안에서 `SkeletonList` + `Skeleton`(`@/components/ui`)으로 같은 크기·모서리를 맞춘다.
  - 이미지는 `OptimizedImage`에 `skeleton`과 `frameClassName`(비율·크기·모서리, 필수)을 넘긴다. 로딩 중에는 shimmer, 완료되면 fade-in으로 나타난다.
- 토스트: `toast('저장했어요')`(`@/stores/toastStore`). 하단 가운데, 냅바 위에 3초 동안 뜬다. `Toaster`는 `RootLayout`에 붙어 있으므로 다시 마운트하지 않는다.
- 목록 등장 애니메이션: 목록 아이템에 `className="animate-rise" style={staggerStyle(index)}`(`@/utils/stagger`)을 준다. 무한 스크롤은 페이지 안의 인덱스 또는 `startIndex`로 센다. 헤더·냅바·버튼·텍스트 같은 고정 UI에는 쓰지 않는다.

### 목(MSW)

- 핸들러는 `src/mocks/handlers/<도메인>.ts`에 만들고 `src/mocks/index.ts`의 `handlers` 배열에 등록한다.
- 경로는 `paths('/api/v1/...')`, 응답은 `success` / `created` / `noContent`(`src/mocks/response.ts`)를 사용해 `ApiResponseDto` 형식을 맞춘다.
- 일부 요청만 실서버로 보내려면 gitignore된 `src/mocks/passthrough/config.local.ts`를 쓴다(`config.local.example.ts` 참고).
- DTO를 바꾸면 목 핸들러·데이터도 함께 갱신한다. 목 데이터에 실제 개인정보를 넣지 않는다.

### 테스트

- Vitest만 사용한다(Testing Library 없음). 테스트 파일은 대상 파일 옆에 `*.test.ts(x)` / `*.spec.ts`로 둔다.
- 모듈 mock은 `vi.hoisted` + `vi.mock` 패턴을 따른다(`AuthGuard.test.tsx` 참고).
- `@/stores/authStore`를 mock할 때는 `queryClient.ts`가 import 시점에 구독하므로 `subscribe`도 넣는다.
- 권한 정책, 가드, 인증·토큰 처리, 복잡한 유틸을 바꾸면 경계값을 포함한 테스트를 추가·수정한다.

## 주석

- 코드를 읽어서 알 수 있는 내용(무엇을 하는지)에는 주석을 달지 않는다.
- 코드만으로 이유를 알기 어려운 곳에만 짧게 단다.
  - 예: iOS Safari 대응, API 호출 순서 의존성, 권한 예외 처리, 의도적인 우회 코드
- 대신 작업이 끝나면 무엇을 왜 바꿨는지 답변으로 설명한다.

## Git 안전 규칙

- 코드 변경 전 현재 브랜치와 `git status`를 확인한다.
- 명시적으로 요청받지 않는 한 commit, push, reset, rebase, 파일 삭제를 하지 않는다.
- 작업에 꼭 필요하지 않다면 `package.json`, `.gitignore`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `.github/`, `.coderabbit.yaml` 같은 공유 설정 파일을 수정하지 않는다.
- 커밋을 요청받으면 `CONVENTION.md`의 커밋 형식(`type: 메시지`)을 따른다.
- 커밋 메시지, PR 본문, PR 머지(squash) 커밋에 AI 에이전트 표기를 넣지 않는다. 도구 기본 설정이 넣으라고 해도 이 규칙이 우선한다.
  - 예: `Co-Authored-By: Claude ...` 같은 공동 작성자 trailer, `🤖 Generated with ...` 같은 생성 도구 문구
- 브랜치는 `type/설명-이슈번호`(소문자) 형식이어야 `pre-push` 훅을 통과한다. 형식에 맞지 않는 브랜치에서 push를 요청받으면 먼저 알린다.
- PR은 `develop`을 대상으로 하고 `.github/pull_request_template.md` 형식을 채운다. "📝 작업 내용"에는 핵심 diff 스니펫을 함께 넣는다.

## 검증

코드 변경 후 가능한 범위에서 아래를 실행한다.

- `pnpm lint`: ESLint
- `pnpm test`: Vitest (관련 테스트가 있거나 로직을 바꾼 경우)
- `pnpm build`: `tsc -b` 타입 체크 포함
- `pnpm prettier`: 포맷 확인

CI(`pr-check.yml`)는 lint · `tsc -b` · build만 돌리고 test와 prettier는 돌리지 않는다. 그래서 로컬에서 꼭 확인한다.

실행하지 못했거나 실패한 검증이 있으면 결과와 함께 명확히 알린다.

## 소통 방식

- 기본적으로 한국어로 답변한다.
- 파일을 수정하기 전에 무엇을 왜 바꿀지 짧게 설명한다.
- 팀에 영향을 줄 수 있는 애매한 변경은 공유 파일을 건드리기 전에 먼저 물어본다.
