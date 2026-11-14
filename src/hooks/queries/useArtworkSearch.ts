import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

import type { SearchArtworksRequestDto } from '@/api/dto';
import { searchArtworks } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

type SearchArtworksParams = Omit<SearchArtworksRequestDto, 'cursor'> & { enabled?: boolean };

// GET /v1/artworks/search: 탐색 작품 탭
export const useInfiniteSearchArtworks = ({ enabled = true, ...params }: SearchArtworksParams) =>
  useInfiniteQuery({
    queryKey: queryKeys.displayArtworks.search(params),
    // 검색어 · 필터를 바꾸는 동안 이전 결과를 두어 목록이 스켈레톤으로 깜빡이지 않게 한다
    placeholderData: keepPreviousData,
    queryFn: ({ pageParam, signal }) => searchArtworks({ ...params, cursor: pageParam }, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasNext && lastPage.pagination.nextCursor !== null
        ? lastPage.pagination.nextCursor
        : undefined,
    enabled,
  });
