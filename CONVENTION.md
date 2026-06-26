# 컨벤션

> 이 문서는 팀의 협업 규칙(커밋·브랜치·네이밍·PR)을 한곳에 모은 가이드입니다.
> 스택: **React + TypeScript + Vite (pnpm)**

---

## 0. 워크플로우

```
이슈 생성 → 브랜치 생성 → 작업 & 커밋 → PR 생성 → 리뷰 → develop 머지
```

---

## 1. 커밋 컨벤션

```
type: 메시지
```

예시: `feat: 로그인 기능 구현`

- 타입은 **소문자만** 사용합니다.
- 한 커밋은 한 가지 의미 단위로 명령형/완료형으로 작성합니다.

### 허용 타입 (12종)

| 타입       | 의미                      | 예시                    |
| :--------- | :------------------------ | :---------------------- |
| `feat`     | 새로운 기능 추가          | 컴포넌트 개발, API 연동 |
| `fix`      | 버그 수정                 | 로직 오류, 크래시 수정  |
| `docs`     | 문서 수정                 | README, 명세서          |
| `style`    | 코드 스타일 (의미 변화 X) | 포매팅, 세미콜론        |
| `design`   | UI 디자인 변경            | CSS, 레이아웃 마크업    |
| `test`     | 테스트 코드               | 테스트 추가/수정        |
| `refactor` | 리팩토링 (기능 변화 X)    | 구조 개선               |
| `ci`       | CI 설정 수정              | GitHub Actions workflow |
| `perf`     | 성능 개선                 | 최적화, 렌더링 속도     |
| `chore`    | 자잘한 수정/설정          | 의존성(pnpm), 도구 설정 |
| `rename`   | 파일/폴더명 변경          | 이름·경로 수정          |
| `remove`   | 파일 삭제                 | 미사용 파일 제거        |

> 위 규칙은 `commitlint.config.js` + `.husky/commit-msg` 로 자동 강제됩니다.

---

## 2. 브랜치 컨벤션

```
type/설명-이슈번호
```

예시: `feat/login-12`, `fix/button-click-34`

| 브랜치      | 역할                                          |
| :---------- | :-------------------------------------------- |
| `main`      | 배포되는 안정 버전. `develop`에서만 머지      |
| `develop`   | 기능이 모이는 통합 브랜치. 평소 작업의 기준점 |
| 작업 브랜치 | 기능/수정 단위로 `develop`에서 분기           |

허용 타입: `feat` `fix` `refactor` `design` `chore` `docs` `ci`

> 위 규칙은 `.husky/pre-push` 로 push 시 검사됩니다.

---

## 3. 네이밍 컨벤션

> ESLint(`check-file`, `@typescript-eslint/naming-convention`)로 강제됩니다.

### 파일 / 폴더

| 대상            |     규칙     | 예시             |
| :-------------- | :----------: | :--------------- |
| `src` 하위 폴더 | `kebab-case` | `navigation-bar` |
| 컴포넌트 (.tsx) | `PascalCase` | `Button.tsx`     |
| 일반 파일 (.ts) | `camelCase`  | `apiClient.ts`   |
| 테스트 파일     |     면제     | `Xxx.test.tsx`   |

### 코드 식별자

| 대상                   |                   규칙                    | 예시                      |
| :--------------------- | :---------------------------------------: | :------------------------ |
| 변수                   | `camelCase` / `UPPER_CASE` / `PascalCase` | `userName`, `MAX_COUNT`   |
| 함수                   |        `camelCase` / `PascalCase`         | `fetchUser()`             |
| 타입 / 인터페이스      |               `PascalCase`                | `UserProps`               |
| enum 멤버              |               `UPPER_CASE`                | `Role.ADMIN`              |
| 컴포넌트               |               `PascalCase`                | `LoginForm`               |
| 클래스                 |               `PascalCase`                | `AuthStore`               |
| 클래스 메서드/프로퍼티 |                `camelCase`                | `fetchUser()`, `userName` |
| private 필드           |          `camelCase` + `_` 허용           | `_token`                  |

> ESLint는 명백한 위반만 거르는 안전망이며, 정밀한 의도는 이 표를 따릅니다.

### Export 규칙

- **`named export`로 통일**합니다. (`default export` 지양)
- Barrel Export 사용을 권장합니다.

```tsx
// src/components/ui/ProductList.tsx
export const ProductList = () => {
  return <div>상품 리스트</div>;
};
```

```ts
// src/components/ui/index.ts
export { Button } from './Button';
export { Modal } from './Modal';
```

```ts
// 사용처 — 폴더 단위로 import
import { Button, Modal } from '@/components/ui';
```
