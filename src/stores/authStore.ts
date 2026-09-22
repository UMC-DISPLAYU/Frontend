import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { queryClient } from '@/queryClient';

import { useUserStore } from './useUserStore';

interface AuthState {
  accessToken: string | null;
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
        queryClient.clear();
        useUserStore.getState().clearUser();
        set({ accessToken: token, sessionVersion: get().sessionVersion + 1 });
      },
      // 같은 세션의 토큰 갱신은 진행 중인 요청과 사용자 캐시를 유지합니다.
      refreshAccessToken: (token) => set({ accessToken: token }),
      clearAccessToken: () => {
        queryClient.clear();
        useUserStore.getState().clearUser();
        set({ accessToken: null, sessionVersion: get().sessionVersion + 1 });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ accessToken: state.accessToken }),
      // 이전 버전에 저장된 user 객체는 복원하지 않습니다.
      merge: (persisted, current) => {
        const token = (persisted as Partial<AuthState> | undefined)?.accessToken;
        return { ...current, accessToken: typeof token === 'string' ? token : null };
      },
    },
  ),
);
