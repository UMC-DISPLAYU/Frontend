import { http } from 'msw';

import { createSuccessJson } from '@/mocks/response';

import {
  mockGoogleLoginUrlResponse,
  mockKakaoLoginUrlResponse,
  mockLoginResponse,
  mockRefreshTokenResponse,
  mockSignupResponse,
} from './auth.mock';

export const authHandlers = [
  http.get('*/v1/auth/kakao/login-url', ({ request }) =>
    createSuccessJson(new URL(request.url).pathname, mockKakaoLoginUrlResponse),
  ),

  http.get('*/v1/auth/google/login-url', ({ request }) =>
    createSuccessJson(new URL(request.url).pathname, mockGoogleLoginUrlResponse),
  ),

  http.post('*/v1/auth/login', ({ request }) =>
    createSuccessJson(new URL(request.url).pathname, mockLoginResponse),
  ),

  http.post('*/v1/auth/signup', ({ request }) =>
    createSuccessJson(new URL(request.url).pathname, mockSignupResponse),
  ),

  http.post('*/v1/auth/refresh', ({ request }) =>
    createSuccessJson(new URL(request.url).pathname, mockRefreshTokenResponse),
  ),

  http.post('*/v1/auth/logout', ({ request }) =>
    createSuccessJson(new URL(request.url).pathname, null),
  ),
];
