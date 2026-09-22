import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import type { ApiResponseDto } from '@/api/dto';
import { useAuthStore } from '@/stores/authStore';
import { savePendingRedirect } from '@/utils/pendingRedirect';

import { ApiError } from './apiError';

export { ApiError } from './apiError';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

type SessionRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _sessionVersion?: number;
};

axiosInstance.interceptors.request.use((config: SessionRequestConfig) => {
  config.headers.set('Accept', 'application/json');

  const { accessToken, sessionVersion } = useAuthStore.getState();
  config._sessionVersion ??= sessionVersion;
  const isSignupRequest = config.url?.includes('/v1/auth/signup');

  if (accessToken && !isSignupRequest && !config.headers.has('Authorization')) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return config;
});

let refresh: { sessionVersion: number; promise: Promise<string> } | null = null;

axiosInstance.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponseDto<unknown>;

    //백엔드 쪽에서 2xx 응답을 보내면서 resultType이 FAIL인 경우가 있음. 이 경우 에러를 throw하도록 처리
    if (data?.resultType === 'FAIL') {
      return Promise.reject(
        new ApiError(data.error?.message || 'API request failed', {
          code: data.error?.code,
          details: data.error?.details,
          status: response.status,
        }),
      );
    }

    return response;
  },
  async (error: AxiosError<ApiResponseDto<unknown>>) => {
    if (axios.isCancel(error)) throw error;

    const originalRequest = error.config as SessionRequestConfig | undefined;
    const data = error.response?.data;

    // 401 에러이고 refresh 요청이 아니며, 아직 재시도하지 않은 경우 토큰 갱신 시도
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.url?.includes('/v1/auth/refresh') &&
      !originalRequest._retry
    ) {
      const sessionVersion = originalRequest._sessionVersion;
      if (sessionVersion !== useAuthStore.getState().sessionVersion) {
        throw new Error('Authentication session changed');
      }
      originalRequest._retry = true;
      if (refresh?.sessionVersion !== sessionVersion) {
        const promise = axiosInstance
          .post<ApiResponseDto<{ accessToken: string }>>('/v1/auth/refresh')
          .then((response) => {
            const token = response.data.success?.data?.accessToken;
            if (!token) throw new Error('Failed to refresh access token');
            if (useAuthStore.getState().sessionVersion !== sessionVersion) {
              throw new Error('Authentication session changed');
            }
            useAuthStore.getState().refreshAccessToken(token);
            return token;
          })
          .catch((refreshError) => {
            if (useAuthStore.getState().sessionVersion !== sessionVersion) throw refreshError;
            useAuthStore.getState().clearAccessToken();
            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
              savePendingRedirect(window.location.pathname + window.location.search);
              window.location.replace('/login');
            }
            throw refreshError;
          })
          .finally(() => {
            if (refresh?.sessionVersion === sessionVersion) refresh = null;
          });
        refresh = { sessionVersion, promise };
      }

      const token = await refresh.promise;
      if (useAuthStore.getState().sessionVersion !== sessionVersion) {
        throw new Error('Authentication session changed');
      }
      originalRequest.headers.set('Authorization', `Bearer ${token}`);
      return axiosInstance(originalRequest);
    }

    if (data?.resultType === 'FAIL') {
      return Promise.reject(
        new ApiError(data.error?.message || 'API request failed', {
          code: data.error?.code,
          details: data.error?.details,
          status: error.response?.status,
          transportCode: error.code,
        }),
      );
    }

    return Promise.reject(
      new ApiError(error.message || 'API request failed', {
        status: error.response?.status,
        transportCode: error.code,
      }),
    );
  },
);
