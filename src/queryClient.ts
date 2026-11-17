import { QueryClient } from '@tanstack/react-query';

import { ApiError, SessionChangedError } from '@/api/apiError';
import { useAuthStore } from '@/stores/authStore';
import { isRequestCanceled } from '@/utils/error';

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: 0,
    },
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (isRequestCanceled(error) || failureCount >= 1) {
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
      /*
       * staleTime 은 기본값(0)을 쓴다. 화면에 들어갈 때 받아 둔 응답을 먼저 그리고 곧바로 서버에 다시 확인한다.
       * 길게 두면 그동안 다른 사람이 바꾼 내용이나 무효화가 빠진 데이터가 새로고침 전까지 예전 값으로 남는다(#568).
       * 거의 바뀌지 않는 데이터(약관 · 주소 검색)만 훅에서 따로 길게 둔다.
       */
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
