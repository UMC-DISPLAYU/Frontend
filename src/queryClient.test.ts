import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { queryClient } from './queryClient';

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => (resolve = done));
  return { promise, resolve };
};

// 앱과 같은 기본 옵션으로 테스트마다 새 캐시를 쓴다
const appClient = () => new QueryClient({ defaultOptions: queryClient.getDefaultOptions() });

afterEach(() => {
  vi.useRealTimers();
});

describe('queryClient 기본 옵션', () => {
  it('staleTime 을 길게 두지 않는다(받아 둔 응답을 화면에 들어갈 때마다 서버에 다시 확인한다)', () => {
    expect(queryClient.getDefaultOptions().queries?.staleTime ?? 0).toBe(0);
  });

  it('방금 받은 데이터라도 화면에 다시 들어가면 받아 둔 값을 먼저 보이고 서버에 다시 묻는다', async () => {
    const client = appClient();
    const key = ['displays', 'detail', 1];
    client.setQueryData(key, { title: '예전 제목' });

    const next = deferred<{ title: string }>();
    const queryFn = vi.fn(() => next.promise);
    const observer = new QueryObserver(client, { queryKey: key, queryFn });

    // 화면이 처음 그릴 때(낙관적 결과) 이미 다시 받는 중이고, 받아 둔 값을 그대로 보인다
    // useQuery 가 첫 렌더에 넘기는 것과 같은 옵션으로 결과를 본다
    const first = observer.getOptimisticResult({
      ...client.defaultQueryOptions({ queryKey: key, queryFn }),
      _optimisticResults: 'optimistic',
    });
    expect(first.data).toEqual({ title: '예전 제목' });
    expect(first.isFetching).toBe(true);
    expect(first.isPending).toBe(false);

    const unsubscribe = observer.subscribe(() => {});
    expect(queryFn).toHaveBeenCalledTimes(1);

    next.resolve({ title: '새 제목' });
    await vi.waitFor(() => expect(observer.getCurrentResult().data).toEqual({ title: '새 제목' }));
    unsubscribe();
  });

  it('약관 · 주소 검색처럼 훅에서 따로 정한 staleTime 은 그대로 쓴다', async () => {
    const client = appClient();
    const key = ['agreements', 'signup'];
    client.setQueryData(key, ['약관']);
    const queryFn = vi.fn(async () => ['새 약관']);
    const observer = new QueryObserver(client, {
      queryKey: key,
      queryFn,
      staleTime: 10 * 60 * 1000,
    });

    const unsubscribe = observer.subscribe(() => {});
    expect(queryFn).not.toHaveBeenCalled();
    unsubscribe();
  });
});
