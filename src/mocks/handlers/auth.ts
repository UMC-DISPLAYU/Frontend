import { delay, http, HttpResponse } from 'msw';

import { created, fail, noContent, paths, readJson, success } from '@/mocks/response';
import { MOCK_DELAY_MS, MOCK_NICKNAMES } from '@/mocks/scenario';

const accessToken = 'mock-access-token';
const refreshToken = 'mock-refresh-token';

// 실서버의 HttpOnly refresh 쿠키 대신 쓴다. 로그인 버튼을 눌러야만 생기고, 없으면 refresh가 401이라 로그인해야 한다
const SESSION_COOKIE = 'mock-refresh-token';

const startSession = () => {
  document.cookie = `${SESSION_COOKIE}=${refreshToken}; path=/; SameSite=Lax`;
};

const endSession = () => {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
};

const hasSession = () =>
  document.cookie.split('; ').some((cookie) => cookie === `${SESSION_COOKIE}=${refreshToken}`);

// 외부 OAuth 화면을 건너뛰고 홈의 토큰 처리(useHomeAuthBootstrap)로 바로 돌아온다
const loginUrlResponse = (path: string) => {
  startSession();
  const url = `/home?accessToken=${accessToken}`;

  return success(path, { authorizationUrl: url, loginUrl: url });
};

export const authHandlers = [
  ...paths('/api/v1/auth/google/login-url').map((path) =>
    http.get(path, () => loginUrlResponse('/api/v1/auth/google/login-url')),
  ),
  ...paths('/api/v1/auth/kakao/login-url').map((path) =>
    http.get(path, () => loginUrlResponse('/api/v1/auth/kakao/login-url')),
  ),
  ...paths('/api/auth/google/callback').map((path) =>
    http.get(path, () => HttpResponse.redirect('/?accessToken=mock-access-token', 302)),
  ),
  ...paths('/api/auth/kakao/callback').map((path) =>
    http.get(path, () => HttpResponse.redirect('/?accessToken=mock-access-token', 302)),
  ),
  ...paths('/api/v1/auth/signup').map((path) =>
    http.post(path, async ({ request }) => {
      const body = await readJson<{ nickname?: string }>(request);

      if (body.nickname === MOCK_NICKNAMES.signupSlow) await delay(MOCK_DELAY_MS);
      if (body.nickname === MOCK_NICKNAMES.signupDuplicate) {
        return fail(
          '/api/v1/auth/signup',
          409,
          'USER_NICKNAME_DUPLICATED',
          '이미 사용 중인 닉네임이에요.',
        );
      }
      if (body.nickname === MOCK_NICKNAMES.signupFail) {
        return fail(
          '/api/v1/auth/signup',
          500,
          'INTERNAL_SERVER_ERROR',
          '회원가입 처리 중 오류가 발생했습니다.',
        );
      }

      startSession();

      return created('/api/v1/auth/signup', {
        userId: 1,
        nickname: body.nickname ?? '디스플레이유',
        accessToken,
        refreshToken,
      });
    }),
  ),
  ...paths('/api/v1/auth/refresh').map((path) =>
    http.post(path, () =>
      hasSession()
        ? success('/api/v1/auth/refresh', { accessToken, refreshToken })
        : fail('/api/v1/auth/refresh', 401, 'UNAUTHORIZED', '로그인이 필요해요.'),
    ),
  ),
  ...paths('/api/v1/auth/logout').map((path) =>
    http.post(path, () => {
      endSession();

      return noContent('/api/v1/auth/logout');
    }),
  ),
];
