import { describe, expect, it, vi } from 'vitest';

import type { DisplayListResponseDataDto } from '@/api/dto';

import { useInfiniteSearchDisplays } from './useDisplayBrowse';

// 훅이 만든 옵션만 꺼내 보려고 useInfiniteQuery 가 옵션을 그대로 돌려주게 한다
vi.mock('@tanstack/react-query', () => ({
  keepPreviousData: undefined,
  useInfiniteQuery: (options: unknown) => options,
  useMutation: (options: unknown) => options,
  useQuery: (options: unknown) => options,
  useQueryClient: () => ({}),
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
});
