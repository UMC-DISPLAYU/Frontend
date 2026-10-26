import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  /* 로그인·로그아웃으로 세션이 바뀔 때만 증가합니다. 서버 캐시 초기화는 queryClient가 구독해 처리합니다. */
  sessionVersion: number;
  setAccessToken: (token: string) => void;
  refreshAccessToken: (token: string) => void;
  clearAccessToken: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      sessionVersion: 0,
      setAccessToken: (token) => {
        if (get().accessToken === token) return;
        set({ accessToken: token, sessionVersion: get().sessionVersion + 1 });
      },
      // 같은 세션의 토큰 갱신은 세션 버전을 올리지 않아 진행 중인 요청과 사용자 캐시를 유지합니다.
      refreshAccessToken: (token) => set({ accessToken: token }),
      clearAccessToken: () => {
        set({ accessToken: null, sessionVersion: get().sessionVersion + 1 });
      },
    }),
    {
      name: 'auth-storage',
      version: 1,
      partialize: (state) => ({ accessToken: state.accessToken }),
      // v0에 저장된 user 객체는 버리고 토큰만 복원합니다.
      migrate: (persisted) => {
        const token = (persisted as { accessToken?: unknown } | undefined)?.accessToken;
        return { accessToken: typeof token === 'string' ? token : null };
      },
    },
  ),
);
