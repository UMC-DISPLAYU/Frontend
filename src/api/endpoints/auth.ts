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
// signupToken은 HttpOnly Cookie로 자동 전송되므로(withCredentials: true) 별도 처리 불필요
export const signup = async (body: SignupRequestDto): Promise<SignupResponseDataDto> =>
  apiRequest('/v1/auth/signup', { method: 'POST', body });

// POST /v1/auth/refresh
export const refreshToken = async (): Promise<RefreshTokenResponseDataDto> =>
  apiRequest('/v1/auth/refresh', { method: 'POST' });

// POST /v1/auth/logout
export const logout = async (body: LogoutRequestDto): Promise<null> =>
  apiRequest('/v1/auth/logout', { method: 'POST', body });
