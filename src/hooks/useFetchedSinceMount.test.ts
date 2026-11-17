import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import { isFetchedSince } from './useFetchedSinceMount';

describe('isFetchedSince', () => {
  it('들어온 시각과 같거나 뒤에 받은 데이터만 새 데이터로 본다', () => {
    expect(isFetchedSince(1000, [{ dataUpdatedAt: 1000 }])).toBe(true);
    expect(isFetchedSince(1000, [{ dataUpdatedAt: 1001 }])).toBe(true);
    expect(isFetchedSince(1000, [{ dataUpdatedAt: 999 }])).toBe(false);
  });

  it('아직 한 번도 받지 않은 쿼리(dataUpdatedAt 0)는 새 데이터가 아니다', () => {
    expect(isFetchedSince(1000, [{ dataUpdatedAt: 0 }])).toBe(false);
  });

  it('여러 쿼리 중 하나라도 예전 데이터면 기다린다', () => {
    expect(isFetchedSince(1000, [{ dataUpdatedAt: 2000 }, { dataUpdatedAt: 500 }])).toBe(false);
    expect(isFetchedSince(1000, [{ dataUpdatedAt: 2000 }, { dataUpdatedAt: 1500 }])).toBe(true);
  });
});

describe('실제 쿼리와 함께', () => {
  const setup = (queryFn: () => Promise<string>) => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const key = ['users', 'me'];
    client.setQueryData(key, '받아 둔 값', { updatedAt: 1 });
    const mountedAt = Date.now();
    const observer = new QueryObserver(client, { queryKey: key, queryFn });
    return { observer, mountedAt };
  };

  it('받아 둔 값은 새 데이터가 아니고, 화면에서 다시 받은 뒤에야 새 데이터가 된다', async () => {
    const { observer, mountedAt } = setup(async () => '새 값');
    expect(isFetchedSince(mountedAt, [observer.getCurrentResult()])).toBe(false);

    const unsubscribe = observer.subscribe(() => {});
    await vi.waitFor(() => expect(observer.getCurrentResult().data).toBe('새 값'));
    expect(isFetchedSince(mountedAt, [observer.getCurrentResult()])).toBe(true);
    unsubscribe();
  });

  it('다시 받기에 실패하면 받아 둔 값은 계속 예전 데이터로 본다(isFetchedAfterMount 는 true 가 되어 쓰지 않는다)', async () => {
    const { observer, mountedAt } = setup(() => Promise.reject(new Error('server')));

    const unsubscribe = observer.subscribe(() => {});
    await vi.waitFor(() => expect(observer.getCurrentResult().isError).toBe(true));
    const result = observer.getCurrentResult();
    expect(result.data).toBe('받아 둔 값');
    expect(result.isFetchedAfterMount).toBe(true);
    expect(isFetchedSince(mountedAt, [result])).toBe(false);
    unsubscribe();
  });
});
