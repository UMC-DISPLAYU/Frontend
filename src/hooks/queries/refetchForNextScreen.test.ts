import { QueryClient, type QueryKey } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queryKeys } from '@/api/queryKeys';

import { refetchForNextScreen } from './refetchForNextScreen';
import { useCreateSectionWithPhotos } from './useContentCategories';
import { useCreateDisplayArtwork, useUpdateDisplayArtwork } from './useDisplayArtworks';
import { usePublishDisplay, useUpdateDisplay } from './useDisplayBrowse';
import { useDeleteDisplay, useExitDisplay, useUpdateMyDisplayNickname } from './useMyDisplays';
import { useUpdateMyArtistProfile, useUpdateNickname, useUpdateUserMe } from './useUserProfile';

const h = vi.hoisted(() => ({ client: null as unknown as QueryClient }));

// 캐시는 진짜 QueryClient 를 쓰고, 훅이 만든 mutation 옵션만 꺼내 본다
vi.mock('@tanstack/react-query', async (original) => ({
  ...(await original<typeof import('@tanstack/react-query')>()),
  useMutation: (options: unknown) => options,
  useQueryClient: () => h.client,
}));
vi.mock('@/api/endpoints', () => ({}));
vi.mock('@/api/endpoints/displayContent', () => ({}));
vi.mock('@/api/endpoints/personalArtwork', () => ({}));

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
};

/* 다음 화면이 쓰는 쿼리를 "지금 화면에 없는(inactive)" 상태로 캐시에 넣는다. 두 번째 요청부터 next 로 답한다 */
const seedInactive = async (queryKey: QueryKey) => {
  const next = deferred<string>();
  const queryFn = vi.fn().mockResolvedValueOnce('예전 값').mockReturnValue(next.promise);
  await h.client.prefetchQuery({ queryKey, queryFn });
  return { queryFn, next };
};

const isSettled = async (promise: Promise<unknown>) => {
  let settled = false;
  void promise.then(
    () => (settled = true),
    () => (settled = true),
  );
  await new Promise((done) => setTimeout(done, 0));
  return settled;
};

beforeEach(() => {
  h.client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});

describe('refetchForNextScreen', () => {
  it('넘긴 key 아래 쿼리도 함께 새로 받는다(내 정보 아래의 작가 프로필 등)', async () => {
    const parent = await seedInactive(queryKeys.users.me());
    const child = await seedInactive(queryKeys.users.artistProfile());

    const done = refetchForNextScreen(h.client, [queryKeys.users.me()]);
    parent.next.resolve('새 내 정보');
    expect(await isSettled(done)).toBe(false);
    child.next.resolve('새 작가 프로필');
    await done;
    expect(h.client.getQueryData(queryKeys.users.artistProfile())).toBe('새 작가 프로필');
  });

  it('지금 화면에 없는 쿼리도 새로 받고, 받을 때까지 끝나지 않는다', async () => {
    const key = queryKeys.users.me();
    const { queryFn, next } = await seedInactive(key);

    const done = refetchForNextScreen(h.client, [key]);
    expect(queryFn).toHaveBeenCalledTimes(2);
    expect(await isSettled(done)).toBe(false);

    next.resolve('새 값');
    await done;
    expect(h.client.getQueryData(key)).toBe('새 값');
  });

  it('다시 받기에 실패해도 저장은 이미 성공했으므로 reject 하지 않는다', async () => {
    const key = queryKeys.users.me();
    const { next } = await seedInactive(key);

    const done = refetchForNextScreen(h.client, [key]);
    next.reject(new Error('server'));
    await expect(done).resolves.toBeUndefined();
    // 실패했으니 다음 화면에서 다시 받도록 오래됨으로 남는다
    expect(h.client.getQueryState(key)?.isInvalidated).toBe(true);
  });

  it('캐시에 없는 쿼리는 요청 없이 바로 끝나고, 넘기지 않은 쿼리는 다시 받지 않는다', async () => {
    const otherKey = queryKeys.loungePosts.all;
    const other = await seedInactive(otherKey);

    await expect(refetchForNextScreen(h.client, [queryKeys.users.me()])).resolves.toBeUndefined();
    expect(other.queryFn).toHaveBeenCalledTimes(1);
    expect(h.client.getQueryState(otherKey)?.isInvalidated).toBe(false);
  });
});

type Callback = (...args: unknown[]) => unknown;
const callback = (hook: unknown, name: 'onSuccess' | 'onSettled') =>
  (hook as Record<string, Callback>)[name];

/* [이름, 저장 뒤 부르는 콜백, 다음 화면이 쓰는 key] */
const cases: [string, () => unknown, QueryKey[]][] = [
  [
    '전시 정보 수정 → 전시 관리 · 내 전시 관리',
    () => callback(useUpdateDisplay(7), 'onSuccess')(),
    [queryKeys.displays.detail(7), [...queryKeys.displays.lists(), 'my']],
  ],
  [
    '심사 요청 → 요청 완료 화면',
    () => callback(usePublishDisplay(), 'onSuccess')(undefined, 7),
    [queryKeys.displays.detail(7)],
  ],
  [
    '작품 등록 → 전시 작업 목록',
    () => callback(useCreateDisplayArtwork(7), 'onSuccess')(),
    [queryKeys.displayArtworks.byDisplayId(7)],
  ],
  [
    '작품 수정 → 전시 작업 목록 · 작품 상세',
    () => callback(useUpdateDisplayArtwork(7), 'onSuccess')(undefined, { artworkId: 3 }),
    [queryKeys.displayArtworks.byDisplayId(7), queryKeys.displayArtworks.detail(3)],
  ],
  [
    '섹션 추가 → 전시 콘텐츠 목록',
    () => callback(useCreateSectionWithPhotos(7), 'onSettled')(),
    [queryKeys.displays.detail(7)],
  ],
  [
    '기본 정보(사진 · 닉네임) 수정 → 마이',
    () => callback(useUpdateUserMe(), 'onSuccess')(),
    [queryKeys.users.me()],
  ],
  [
    '닉네임 수정 → 마이',
    () => callback(useUpdateNickname(), 'onSuccess')(),
    [queryKeys.users.me()],
  ],
  [
    '작가 프로필 수정 → 마이',
    () => callback(useUpdateMyArtistProfile(), 'onSuccess')(),
    [queryKeys.users.artistProfile()],
  ],
  [
    '전시 작가명 수정 → 내 전시 관리 카드 · 전시 작업',
    () =>
      callback(useUpdateMyDisplayNickname(), 'onSuccess')(undefined, {
        displayId: 7,
        displayNickname: '새 이름',
      }),
    [
      [...queryKeys.displays.lists(), 'my'],
      queryKeys.displays.detail(7),
      queryKeys.displayArtworks.byDisplayId(7),
    ],
  ],
  [
    '전시 삭제 → 내 전시 관리 목록',
    () => callback(useDeleteDisplay(), 'onSuccess')(undefined, 7),
    [[...queryKeys.displays.lists(), 'my']],
  ],
  [
    '전시 나가기 → 내 전시 관리 목록',
    () => callback(useExitDisplay(), 'onSuccess')(undefined, 7),
    [[...queryKeys.displays.lists(), 'my']],
  ],
];

describe.each(cases)('%s', (_, save, nextScreenKeys) => {
  it('다음 화면 데이터를 새로 받을 때까지 저장 중으로 남는다', async () => {
    const seeded = await Promise.all(nextScreenKeys.map(seedInactive));

    const done = Promise.resolve(save());
    for (const { queryFn } of seeded) expect(queryFn).toHaveBeenCalledTimes(2);

    // 하나라도 아직이면 끝나지 않는다
    for (const { next } of seeded.slice(0, -1)) next.resolve('새 값');
    expect(await isSettled(done)).toBe(false);

    seeded.at(-1)!.next.resolve('새 값');
    await done;
    for (const key of nextScreenKeys) expect(h.client.getQueryData(key)).toBe('새 값');
  });
});
