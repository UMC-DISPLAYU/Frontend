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

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

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

    /*
     * 401 에러이고 refresh 요청이 아니며, 아직 재시도하지 않은 경우 토큰 갱신 시도.
     * 단, 애초에 accessToken이 없던 요청(로그인한 적 없는 게스트)은 세션 만료가 아니므로
     * refresh나 로그인 페이지 강제 이동 없이 그냥 에러로 흘려보냅니다 — 그래야 공개 페이지가
     * 비로그인 상태에서도 로그인 화면으로 튕기지 않고 정상적으로 보여집니다.
     */
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.url?.includes('/v1/auth/refresh') &&
      !originalRequest._retry &&
      useAuthStore.getState().accessToken
    ) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const response =
            await axiosInstance.post<ApiResponseDto<{ accessToken: string }>>('/v1/auth/refresh');

          const newAccessToken = response.data?.success?.data?.accessToken;

          if (!newAccessToken) {
            throw new Error('Failed to refresh access token');
          }

          useAuthStore.getState().setAccessToken(newAccessToken);
          isRefreshing = false;
          onRefreshed(newAccessToken);

          // 원래 요청 재시도 (재시도 플래그 설정)
          originalRequest._retry = true;
          if (originalRequest.headers) {
            originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
          }
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          useAuthStore.getState().clearAccessToken();
          refreshSubscribers = [];
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            import('@/utils/pendingRedirect').then(({ savePendingRedirect }) => {
              savePendingRedirect(window.location.pathname + window.location.search);
              window.location.replace('/login');
            });
          } else {
            return Promise.reject(refreshError);
          }
        }
      }

      // 이미 갱신 중이면 대기 (재시도 플래그 설정)
      return new Promise((resolve) => {
        addRefreshSubscriber((token: string) => {
          originalRequest._retry = true;
          if (originalRequest.headers) {
            originalRequest.headers.set('Authorization', `Bearer ${token}`);
          }
          resolve(axiosInstance(originalRequest));
        });
      });
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
