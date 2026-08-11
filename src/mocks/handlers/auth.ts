import { http, HttpResponse } from 'msw';

import { created, noContent, paths, readJson, success } from '@/mocks/response';

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
