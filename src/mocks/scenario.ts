/**
 * 실패·지연 화면을 확인하기 위한 목 시나리오.
 *
 * - 페이지 URL 쿼리: `/onboarding?mock=agreements-fail` 처럼 붙인다. 여러 개는 `?mock=a&mock=b`.
 *   MSW 브라우저 핸들러는 페이지에서 실행되므로 현재 페이지 주소를 읽을 수 있다.
 * - 닉네임: 아래 MOCK_NICKNAMES 값을 입력하면 해당 응답을 돌려준다.
 */
export type MockScenario = 'agreements-fail' | 'agreements-empty' | 'agreements-slow';

export const hasMockScenario = (scenario: MockScenario) =>
  new URLSearchParams(window.location.search).getAll('mock').includes(scenario);

export const MOCK_NICKNAMES = {
  /** 중복 확인: 사용 중인 닉네임 */
  duplicate: '중복닉네임',
  /** 중복 확인: 서버 오류(500) */
  checkFail: '확인실패',
  /** 중복 확인: 2초 지연 */
  checkSlow: '느린확인',
  /** 가입: 확인 이후 다른 사람이 먼저 가입한 경우(409) */
  signupDuplicate: '가입중복',
  /** 가입: 서버 오류(500) */
  signupFail: '가입실패',
  /** 가입: 2초 지연 */
  signupSlow: '느린가입',
} as const;

export const MOCK_DELAY_MS = 2000;
