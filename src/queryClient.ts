import { QueryClient } from '@tanstack/react-query';

import { ApiError, SessionChangedError } from '@/api/apiError';
import { useAuthStore } from '@/stores/authStore';

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: 0,
    },
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (failureCount >= 1) {
          return false;
        }

        if (error instanceof SessionChangedError) {
          return false;
        }

        if (error instanceof ApiError) {
          return !error.status || error.status >= 500;
        }

        return true;
      },
      staleTime: 1000 * 60,
    },
  },
});

/*
 * 로그인·로그아웃·탈퇴로 세션이 바뀌면 이전 계정의 서버 상태를 비웁니다.
 * 호출부마다 초기화를 적지 않도록 세션 버전 변경을 한 곳에서 구독하고, 토큰 갱신은 제외합니다.
 */
useAuthStore.subscribe((state, prevState) => {
  if (state.sessionVersion !== prevState.sessionVersion) {
    queryClient.clear();
  }
});
