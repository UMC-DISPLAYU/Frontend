import { useInfiniteQuery } from '@tanstack/react-query';

import { getDisplayReviews } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

const DEFAULT_SIZE = 20;

export const useDisplayReviews = (displayId: number) =>
  useInfiniteQuery({
    queryKey: queryKeys.displays.reviews(displayId),
    queryFn: ({ pageParam }) =>
      getDisplayReviews(displayId, {
        cursorId: pageParam ?? undefined,
        size: DEFAULT_SIZE,
      }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursorId : null),
    enabled: Number.isFinite(displayId) && displayId > 0,
  });
