import type { ReactNode } from 'react';

import { ErrorView } from '@/components/common';
import { SkeletonList } from '@/components/ui';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useSkeleton } from '@/hooks/useSkeleton';
import { getErrorMessage } from '@/utils/error';
import { staggerStyle } from '@/utils/stagger';

// 프로토타입 .grid: 2열 → 640px 3열 → 1000px 4열 → 1280px 5열, 세로 24 · 가로 12
const GRID_CLASS =
  'mt-3 grid grid-cols-2 gap-x-3 gap-y-6 min-[640px]:grid-cols-3 min-[1000px]:grid-cols-4 min-[1280px]:grid-cols-5';

type ExploreResultGridProps<T> = {
  /** 무한 스크롤로 받은 페이지별 항목 */
  pages: T[][];
  getKey: (item: T) => number;
  renderItem: (item: T) => ReactNode;
  renderSkeleton: () => ReactNode;
  /** 안내 문구에 쓰는 목적어. 예: '전시를' */
  itemObject: string;
  isPending: boolean;
  isError: boolean;
  isFetchNextPageError: boolean;
  error: unknown;
  refetch: () => unknown;
  fetchNextPage: () => unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
};

type LoadMoreTriggerProps = {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
};

// 스켈레톤이 끝나 목록과 함께 마운트될 때 감시를 건다(부모에서 걸면 스켈레톤 동안 대상이 없어 다음 페이지를 못 받는다)
function LoadMoreTrigger({ hasNextPage, isFetchingNextPage, fetchNextPage }: LoadMoreTriggerProps) {
  const triggerRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    rootMargin: '0px 0px 400px 0px',
  });

  return <div aria-hidden="true" className="h-1" ref={triggerRef} />;
}

function ExploreEmpty() {
  return (
    <div className="pt-30 pb-20 text-center">
      <strong className="typography-body-xl-semibold block">검색 결과가 없어요</strong>
      <p className="mt-1.5 text-[#3f3f47]">다른 검색어나 필터로 찾아보세요</p>
    </div>
  );
}

export function ExploreResultGrid<T>({
  pages,
  getKey,
  renderItem,
  renderSkeleton,
  itemObject,
  isPending,
  isError,
  isFetchNextPageError,
  error,
  refetch,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: ExploreResultGridProps<T>) {
  const hasItems = pages.some((page) => page.length > 0);
  const { showSkeleton, skeletonProps } = useSkeleton(isPending);

  if (showSkeleton) {
    return (
      <ul {...skeletonProps} aria-label={`${itemObject} 불러오는 중`} className={GRID_CLASS}>
        <SkeletonList count={6}>
          {() => <li aria-hidden="true">{renderSkeleton()}</li>}
        </SkeletonList>
      </ul>
    );
  }

  if (isError && !hasItems) {
    return (
      <ErrorView
        fullScreen={false}
        message={getErrorMessage(error, `${itemObject} 검색하지 못했어요.`)}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (!hasItems) return <ExploreEmpty />;

  return (
    <>
      <ul {...skeletonProps} className={GRID_CLASS}>
        {pages.map((page) =>
          page.map((item, index) => (
            <li className="animate-rise" key={getKey(item)} style={staggerStyle(index)}>
              {renderItem(item)}
            </li>
          )),
        )}
      </ul>
      {isError ? (
        <ErrorView
          fullScreen={false}
          message={getErrorMessage(error, `${itemObject} 더 불러오지 못했어요.`)}
          onRetry={() => {
            void (isFetchNextPageError ? fetchNextPage() : refetch());
          }}
        />
      ) : null}
      <LoadMoreTrigger
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage && !isError}
        isFetchingNextPage={isFetchingNextPage}
      />
    </>
  );
}
