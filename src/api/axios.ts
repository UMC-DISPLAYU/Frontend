import axios, { AxiosError } from 'axios';

import type { ApiResponseDto } from '@/api/dto';
import { useAuthStore } from '@/stores/authStore';

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
  (error: AxiosError<ApiResponseDto<unknown>>) => {
    const data = error.response?.data;

    // 비로그인 상태로 로그인이 필요한 요청을 보내면 로그인 페이지로 이동
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      window.location.href = '/login';
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
