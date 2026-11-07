import { delay, http, HttpResponse } from 'msw';

import { created, fail, noContent, paths, readJson, success } from '@/mocks/response';
import { MOCK_DELAY_MS, MOCK_NICKNAMES } from '@/mocks/scenario';

const accessToken = 'mock-access-token';
const refreshToken = 'mock-refresh-token';

export const authHandlers = [
  ...paths('/api/v1/auth/google/login-url').map((path) =>
    http.get(path, () =>
      success('/api/v1/auth/google/login-url', {
        authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth?mock=true',
        loginUrl: 'https://accounts.google.com/o/oauth2/v2/auth?mock=true',
      }),
    ),
  ),
  ...paths('/api/v1/auth/kakao/login-url').map((path) =>
    http.get(path, () =>
      success('/api/v1/auth/kakao/login-url', {
        authorizationUrl: 'https://kauth.kakao.com/oauth/authorize?mock=true',
        loginUrl: 'https://kauth.kakao.com/oauth/authorize?mock=true',
      }),
    ),
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
        return fail('/api/v1/auth/signup', 409, {
          code: 'USER_NICKNAME_DUPLICATED',
          message: '이미 사용 중인 닉네임이에요.',
        });
      }
      if (body.nickname === MOCK_NICKNAMES.signupFail) {
        return fail('/api/v1/auth/signup', 500, {
          code: 'INTERNAL_SERVER_ERROR',
          message: '회원가입 처리 중 오류가 발생했습니다.',
        });
      }

      return created('/api/v1/auth/signup', {
        userId: 1,
        nickname: body.nickname ?? '디스플레이유',
        accessToken,
        refreshToken,
      });
    }),
  ),
  ...paths('/api/v1/auth/refresh').map((path) =>
    http.post(path, () => success('/api/v1/auth/refresh', { accessToken, refreshToken })),
  ),
  ...paths('/api/v1/auth/logout').map((path) =>
    http.post(path, () => noContent('/api/v1/auth/logout')),
  ),
];
