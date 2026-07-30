import { useInfiniteQuery } from '@tanstack/react-query';

import { getDisplayReviewReplies } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

const DEFAULT_SIZE = 10;

export const useDisplayReviewReplies = (
  displayId: number,
  displayReviewId: number,
  enabled = true,
) =>
  useInfiniteQuery({
    queryKey: queryKeys.displays.reviewReplies(displayId, displayReviewId),
    queryFn: ({ pageParam }) =>
      getDisplayReviewReplies(displayId, displayReviewId, {
        cursorId: pageParam ?? undefined,
        size: DEFAULT_SIZE,
      }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursorId : null),
    enabled:
      enabled &&
      Number.isFinite(displayId) &&
      displayId > 0 &&
      Number.isFinite(displayReviewId) &&
      displayReviewId > 0,
  });
