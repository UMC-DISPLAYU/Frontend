import { useEffect } from 'react';

// 검색 API가 전체 개수를 주지 않아 남은 페이지를 받아 센다. 넓은 검색어로 요청이 몰리지 않게 페이지 수를 제한한다
export const MAX_COUNT_PAGES = 5;

type SearchResultCountParams = {
  /** 검색어가 있을 때만 센다 */
  active: boolean;
  pageItemCounts: number[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isError: boolean;
  isPlaceholderData: boolean;
  fetchNextPage: () => unknown;
};

/** 다 받았으면 `37`, 상한까지 받고도 남아 있으면 `100+`, 아직 세는 중이면 null */
export const formatResultCount = ({
  pageItemCounts,
  hasNextPage,
}: Pick<SearchResultCountParams, 'pageItemCounts' | 'hasNextPage'>) => {
  const count = pageItemCounts.reduce((sum, itemCount) => sum + itemCount, 0);

  if (!hasNextPage) return `${count}`;
  if (pageItemCounts.length >= MAX_COUNT_PAGES) return `${count}+`;
  return null;
};

export function useSearchResultCount({
  active,
  pageItemCounts,
  hasNextPage,
  isFetchingNextPage,
  isError,
  isPlaceholderData,
  fetchNextPage,
}: SearchResultCountParams) {
  const shouldFetchMore =
    active &&
    !isPlaceholderData &&
    !isError &&
    hasNextPage &&
    pageItemCounts.length > 0 &&
    pageItemCounts.length < MAX_COUNT_PAGES;

  useEffect(() => {
    if (shouldFetchMore && !isFetchingNextPage) void fetchNextPage();
  }, [shouldFetchMore, isFetchingNextPage, fetchNextPage]);

  if (!active || isPlaceholderData || isError || pageItemCounts.length === 0) return null;

  return formatResultCount({ pageItemCounts, hasNextPage });
}
