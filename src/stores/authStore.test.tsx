import { renderToStaticMarkup } from 'react-dom/server';

import { QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UserProfileDto } from '@/api/dto';
import { queryKeys } from '@/api/queryKeys';
import { useCurrentPolicyUser } from '@/hooks/usePolicy';
import { queryClient } from '@/queryClient';

import { useAuthStore } from './authStore';
import { useUserStore } from './useUserStore';

const storage = vi.hoisted(() => {
  const items = new Map<string, string>();
  const storage = {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      items.set(key, value);
    },
    removeItem: (key: string) => {
      items.delete(key);
    },
    clear: () => items.clear(),
  };
  vi.stubGlobal('window', { localStorage: storage });
  return storage;
});

// SSR의 초기 snapshot 대신 실제 store의 현재 상태로 훅을 읽는다.
vi.mock('./authStore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./authStore')>();
  const store = actual.useAuthStore;
  return {
    useAuthStore: Object.assign(
      (selector: (state: ReturnType<typeof store.getState>) => unknown) =>
        selector(store.getState()),
      store,
    ),
  };
});

const me: UserProfileDto = {
  id: 1,
  provider: 'GOOGLE',
  name: '작가',
  nickname: 'artist',
  isVerified: false,
  socialEmail: 'artist@example.com',
  schoolEmail: null,
};

function PolicyUser() {
  const user = useCurrentPolicyUser();
  return (
    <span>
      {user.id ?? 'guest'}:{String(user.isArtistVerified)}
    </span>
  );
}

const renderUser = () =>
  renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>
      <PolicyUser />
    </QueryClientProvider>,
  );

beforeEach(() => {
  useAuthStore.getState().clearAccessToken();
  storage.clear();
});

describe('사용자 세션과 Query 캐시', () => {
  it('새 로그인과 로그아웃은 이전 계정 캐시와 전시 작가명을 비운다', () => {
    useAuthStore.getState().setAccessToken('account-a');
    queryClient.setQueryData(queryKeys.users.me(), me);
    queryClient.setQueryData(['private-data'], ['account-a']);
    useUserStore.getState().setDisplayArtistName('이전 전시 작가');

    useAuthStore.getState().setAccessToken('account-b');
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    expect(useUserStore.getState().displayArtistName).toBe('');
    queryClient.setQueryData(queryKeys.users.me(), { ...me, id: 2 });
    useAuthStore.getState().clearAccessToken();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  });

  it('같은 세션의 토큰 갱신은 캐시와 작성 중인 전시 작가명을 유지한다', () => {
    useAuthStore.getState().setAccessToken('old-token');
    queryClient.setQueryData(queryKeys.users.me(), me);
    useUserStore.getState().setDisplayArtistName('전시 작가');
    useAuthStore.getState().refreshAccessToken('new-token');
    expect(queryClient.getQueryData(queryKeys.users.me())).toEqual(me);
    expect(useUserStore.getState().displayArtistName).toBe('전시 작가');
    expect(useAuthStore.getState().accessToken).toBe('new-token');
  });

  it('계정 전환 전 시작한 응답은 새 계정의 캐시를 덮어쓰지 않는다', async () => {
    useAuthStore.getState().setAccessToken('account-a');
    let resolve!: (value: UserProfileDto) => void;
    const pending = queryClient
      .fetchQuery({
        queryKey: queryKeys.users.me(),
        queryFn: () =>
          new Promise<UserProfileDto>((done) => {
            resolve = done;
          }),
      })
      .catch(() => undefined);
    useAuthStore.getState().setAccessToken('account-b');
    queryClient.setQueryData(queryKeys.users.me(), { ...me, id: 2 });
    resolve(me);
    await pending;
    expect(queryClient.getQueryData(queryKeys.users.me())).toMatchObject({ id: 2 });
  });

  it('이전 저장 형식의 user는 복원하지 않고 토큰만 유지한다', async () => {
    storage.setItem(
      'auth-storage',
      JSON.stringify({
        state: { accessToken: 'persisted-token', user: { id: 99, isArtistVerified: true } },
        version: 0,
      }),
    );
    await useAuthStore.persist.rehydrate();
    expect(useAuthStore.getState().accessToken).toBe('persisted-token');
    expect('user' in useAuthStore.getState()).toBe(false);
    useAuthStore.getState().refreshAccessToken('new-token');
    expect(JSON.parse(storage.getItem('auth-storage')!).state).toEqual({
      accessToken: 'new-token',
    });
  });

  it('권한 사용자는 Query의 최신 인증 상태를 읽고 비로그인 상태는 게스트로 처리한다', () => {
    useAuthStore.getState().setAccessToken('token');
    queryClient.setQueryData(queryKeys.users.me(), me);
    expect(renderUser()).toContain('1:false');
    queryClient.setQueryData(queryKeys.users.me(), { ...me, isVerified: true });
    expect(renderUser()).toContain('1:true');
    useAuthStore.getState().clearAccessToken();
    queryClient.setQueryData(queryKeys.users.me(), { ...me, isVerified: true });
    expect(renderUser()).toContain('guest:false');
  });
});
