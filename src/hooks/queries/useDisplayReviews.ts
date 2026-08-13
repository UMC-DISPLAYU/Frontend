import type { InfiniteData } from '@tanstack/react-query';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateDisplayReviewRequestDto, GetDisplayReviewsResponseDataDto } from '@/api/dto';
import {
  cancelDisplayReviewLike,
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
      queryClient.invalidateQueries({ queryKey: [...queryKeys.displays.all, 'reviews'] });
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
      queryClient.invalidateQueries({ queryKey: [...queryKeys.displays.all, 'reviews'] });
    },
  });
};

export const useToggleDisplayReviewLike = (displayId: number) => {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.displays.reviews(displayId);

  return useMutation({
    mutationFn: ({ displayReviewId, liked }: { displayReviewId: number; liked: boolean }) =>
      liked
        ? cancelDisplayReviewLike(displayId, displayReviewId)
        : toggleDisplayReviewLike(displayId, displayReviewId),
    onMutate: async ({ displayReviewId, liked }) => {
      await queryClient.cancelQueries({ queryKey, exact: true });

      const previousData =
        queryClient.getQueryData<InfiniteData<GetDisplayReviewsResponseDataDto>>(queryKey);

      queryClient.setQueryData<InfiniteData<GetDisplayReviewsResponseDataDto>>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            reviews: page.reviews.map((review) =>
              review.displayReviewId === displayReviewId
                ? {
                    ...review,
                    isLiked: !liked,
                    likeCount: Math.max(review.likeCount + (liked ? -1 : 1), 0),
                  }
                : review,
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (_, __, context) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey, exact: true });
    },
  });
};
