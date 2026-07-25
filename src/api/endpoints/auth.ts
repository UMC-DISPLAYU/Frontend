import type {
  LoginRequestDto,
  LoginResponseDataDto,
  RefreshTokenResponseDataDto,
  SignupRequestDto,
  SignupResponseDataDto,
} from '@/api/dto';

import { apiRequest } from '../client';

// POST /v1/auth/login
export const login = async (body: LoginRequestDto): Promise<LoginResponseDataDto> =>
  apiRequest('/v1/auth/login', { method: 'POST', body });

// POST /v1/auth/signup
export const signup = async (body: SignupRequestDto): Promise<SignupResponseDataDto> =>
  apiRequest('/v1/auth/signup', { method: 'POST', body });

// POST /v1/auth/refresh
export const refreshToken = async (): Promise<RefreshTokenResponseDataDto> =>
  apiRequest('/v1/auth/refresh', { method: 'POST' });

// POST /v1/auth/logout
export const logout = async (): Promise<null> => apiRequest('/v1/auth/logout', { method: 'POST' });
