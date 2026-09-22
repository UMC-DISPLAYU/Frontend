import axios, { AxiosError } from 'axios';

import type { ApiResponseDto } from '@/api/dto';
import { useAuthStore } from '@/stores/authStore';
import { savePendingRedirect } from '@/utils/pendingRedirect';

export class ApiError extends Error {
  code?: string;
  details?: string | null;
  status?: number;

  constructor(
    message: string,
    options: { code?: string; details?: string | null; status?: number } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = options.code;
    this.details = options.details;
    this.status = options.status;
  }
}

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  config.headers.set('Accept', 'application/json');

  const accessToken = useAuthStore.getState().accessToken;
  const isSignupRequest = config.url?.includes('/v1/auth/signup');

  if (accessToken && !isSignupRequest && !config.headers.has('Authorization')) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return config;
});

let refreshPromise: Promise<string> | null = null;

axiosInstance.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponseDto<unknown>;

    //백엔드 쪽에서 2xx 응답을 보내면서 resultType이 FAIL인 경우가 있음. 이 경우 에러를 throw하도록 처리
    if (data.resultType === 'FAIL') {
      return Promise.reject(
        new ApiError(data.error.message, {
          code: data.error.code,
          details: data.error.details,
          status: response.status,
        }),
      );
    }

    return response;
  },
  async (error: AxiosError<ApiResponseDto<unknown>>) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    const data = error.response?.data;

    // 401 에러이고 refresh 요청이 아니며, 아직 재시도하지 않은 경우 토큰 갱신 시도
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.url?.includes('/v1/auth/refresh') &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      refreshPromise ??= axiosInstance
        .post<ApiResponseDto<{ accessToken: string }>>('/v1/auth/refresh')
        .then((response) => {
          const token = response.data.success?.data?.accessToken;
          if (!token) throw new Error('Failed to refresh access token');

          useAuthStore.getState().setAccessToken(token);
          return token;
        })
        .catch((refreshError) => {
          useAuthStore.getState().clearAccessToken();
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            savePendingRedirect(window.location.pathname + window.location.search);
            window.location.replace('/login');
          }
          throw refreshError;
        })
        .finally(() => {
          refreshPromise = null;
        });

      const token = await refreshPromise;
      originalRequest.headers.set('Authorization', `Bearer ${token}`);
      return axiosInstance(originalRequest);
    }

    if (data?.resultType === 'FAIL') {
      return Promise.reject(
        new ApiError(data.error.message, {
          code: data.error.code,
          details: data.error.details,
          status: error.response?.status,
        }),
      );
    }

    return Promise.reject(
      new ApiError(error.message || 'API request failed', {
        status: error.response?.status,
      }),
    );
  },
);
