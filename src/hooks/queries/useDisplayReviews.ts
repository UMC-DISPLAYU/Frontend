import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateDisplayReviewRequestDto } from '@/api/dto';
import {
  createDisplayReview,
  deleteDisplayReview,
  getDisplayReviews,
  toggleDisplayReviewLike,
} from '@/api/endpoints';
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

export const useCreateDisplayReview = (displayId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateDisplayReviewRequestDto) => createDisplayReview(displayId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.displays.reviews(displayId),
        exact: true,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) });
    },
  });
};

export const useDeleteDisplayReview = (displayId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (displayReviewId: number) => deleteDisplayReview(displayId, displayReviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.displays.reviews(displayId),
        exact: true,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) });
    },
  });
};

export const useToggleDisplayReviewLike = (displayId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (displayReviewId: number) => toggleDisplayReviewLike(displayId, displayReviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.displays.reviews(displayId),
        exact: true,
      });
    },
  });
};
