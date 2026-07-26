import type {
  LoginRequestDto,
  LoginResponseDataDto,
  LogoutRequestDto,
  OAuthAuthorizationUrlResponseDto,
  RefreshTokenResponseDataDto,
  SignupRequestDto,
  SignupResponseDataDto,
} from '@/api/dto';

import { apiRequest } from '../client';

// POST /v1/auth/login
export const login = async (body: LoginRequestDto): Promise<LoginResponseDataDto> =>
  apiRequest('/v1/auth/login', { method: 'POST', body });

// GET /auth/kakao/login-url
export const getKakaoAuthorizationUrl = async (): Promise<OAuthAuthorizationUrlResponseDto> =>
  apiRequest('/auth/kakao/login-url');

// GET /auth/google/login-url
export const getGoogleAuthorizationUrl = async (): Promise<OAuthAuthorizationUrlResponseDto> =>
  apiRequest('/auth/google/login-url');

// POST /v1/auth/signup
export const signup = async (
  body: SignupRequestDto,
  signupToken: string | null,
): Promise<SignupResponseDataDto> =>
  apiRequest('/v1/auth/signup', {
    headers: signupToken ? { Authorization: `Bearer ${signupToken}` } : undefined,
    method: 'POST',
    body,
  });

// POST /v1/auth/refresh
export const refreshToken = async (): Promise<RefreshTokenResponseDataDto> =>
  apiRequest('/v1/auth/refresh', { method: 'POST' });

// POST /v1/auth/logout
export const logout = async (body: LogoutRequestDto): Promise<null> =>
  apiRequest('/v1/auth/logout', { method: 'POST', body });
