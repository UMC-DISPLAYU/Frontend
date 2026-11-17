import { afterEach, describe, expect, it, vi } from 'vitest';

import type { DisplayListResponseDataDto } from '@/api/dto';
import { queryKeys } from '@/api/queryKeys';

import { useHideDisplay, useInfiniteSearchDisplays, useUpdateDisplay } from './useDisplayBrowse';

const h = vi.hoisted(() => ({ invalidateQueries: vi.fn() }));

// 훅이 만든 옵션만 꺼내 보려고 useInfiniteQuery 가 옵션을 그대로 돌려주게 한다
vi.mock('@tanstack/react-query', () => ({
  keepPreviousData: undefined,
  useInfiniteQuery: (options: unknown) => options,
  useMutation: (options: unknown) => options,
  useQuery: (options: unknown) => options,
  useQueryClient: () => ({ invalidateQueries: h.invalidateQueries }),
}));
vi.mock('@/api/endpoints', () => ({}));

type InfiniteOptions = {
  initialPageParam: unknown;
  getNextPageParam: (lastPage: DisplayListResponseDataDto) => unknown;
};

const lastPage = (
  pagination: Partial<DisplayListResponseDataDto['pagination']>,
): DisplayListResponseDataDto => ({
  exhibitions: [],
  pagination: { nextCursor: null, size: 20, hasNext: false, ...pagination },
});

const useSearchOptions = (sort: 'LATEST' | 'LIKES') =>
  useInfiniteSearchDisplays({ sort, size: 20 }) as unknown as InfiniteOptions;

describe('useInfiniteSearchDisplays', () => {
  it('첫 페이지는 cursor 0 으로 받는다', () => {
    expect(useSearchOptions('LATEST').initialPageParam).toEqual({ cursor: 0 });
  });

  it('최신순 다음 페이지는 nextCursor 만 보낸다', () => {
    const next = useSearchOptions('LATEST').getNextPageParam(
      lastPage({ hasNext: true, nextCursor: 17, nextCursorLikeCount: 3 }),
    );
    expect(next).toEqual({ cursor: 17 });
  });

  it('좋아요순 다음 페이지는 nextCursorLikeCount 를 cursorLikeCount 로 함께 보낸다', () => {
    const next = useSearchOptions('LIKES').getNextPageParam(
      lastPage({ hasNext: true, nextCursor: 17, nextCursorLikeCount: 0 }),
    );
    expect(next).toEqual({ cursor: 17, cursorLikeCount: 0 });
  });

  it('다음 페이지가 없거나 커서가 없으면 멈춘다', () => {
    const { getNextPageParam } = useSearchOptions('LIKES');
    expect(getNextPageParam(lastPage({ hasNext: false, nextCursor: 17 }))).toBeUndefined();
    expect(getNextPageParam(lastPage({ hasNext: true, nextCursor: null }))).toBeUndefined();
  });

  it('좋아요순인데 nextCursorLikeCount 가 없으면 멈춘다', () => {
    const next = useSearchOptions('LIKES').getNextPageParam(
      lastPage({ hasNext: true, nextCursor: 17 }),
    );
    expect(next).toBeUndefined();
  });
});

const invalidatedKeys = () =>
  h.invalidateQueries.mock.calls.map(([filters]) => (filters as { queryKey: unknown }).queryKey);

describe('전시 변경 후 캐시 무효화', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('전시 정보를 고치면 전시 정보를 담은 작품 목록 · 상세와 보관함 전시도 다시 받는다', () => {
    (useUpdateDisplay(7) as unknown as { onSuccess: () => void }).onSuccess();

    expect(invalidatedKeys()).toEqual(
      expect.arrayContaining([
        queryKeys.displays.detail(7),
        queryKeys.displays.lists(),
        queryKeys.displayArtworks.all,
        queryKeys.archives.displays.all(),
      ]),
    );
  });

  it('전시를 비공개로 돌리면 작품 목록도 다시 받는다', () => {
    (useHideDisplay() as unknown as { onSuccess: (data: unknown, id: number) => void }).onSuccess(
      undefined,
      7,
    );

    expect(invalidatedKeys()).toEqual(
      expect.arrayContaining([
        queryKeys.displays.detail(7),
        queryKeys.displays.lists(),
        queryKeys.displayArtworks.lists(),
      ]),
    );
  });
});
