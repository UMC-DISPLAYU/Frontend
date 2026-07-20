import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  CreateDisplayReviewRequestDto,
  DisplayDetailDto,
  UpdateDisplayReviewRequestDto,
} from '@/api/dto';
import {
  createDisplayReview,
  deleteDisplayReview,
  getDisplayDetail,
  getDisplayReviews,
  toggleDisplayLike,
  updateDisplayReview,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useDisplayDetail = (displayId: number) =>
  useQuery({
    queryKey: queryKeys.displays.detail(displayId),
    queryFn: () => getDisplayDetail(displayId),
    enabled: Number.isFinite(displayId),
  });

export const useDisplayReviews = (displayId: number, params: { page: number; size: number }) =>
  useQuery({
    queryKey: queryKeys.displays.reviews(displayId, params),
    queryFn: () => getDisplayReviews(displayId, params),
    enabled: Number.isFinite(displayId),
  });

export const useToggleDisplayLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (displayId: number) => toggleDisplayLike(displayId),
    onSuccess: (data, displayId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.archives.displays.lists() });
      queryClient.setQueryData(
        queryKeys.displays.detail(displayId),
        (current: DisplayDetailDto | undefined) =>
          current ? { ...current, isLiked: data.isLiked, likeCount: data.likeCount } : current,
      );
    },
  });
};

export const useLikeDisplay = useToggleDisplayLike;

export const useCancelLikeDisplay = useToggleDisplayLike;

export const useCreateDisplayReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ displayId, body }: { displayId: number; body: CreateDisplayReviewRequestDto }) =>
      createDisplayReview(displayId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(variables.displayId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.displays.reviewLists(variables.displayId),
      });
    },
  });
};

export const useUpdateDisplayReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      displayId,
      reviewId,
      body,
    }: {
      displayId: number;
      reviewId: number;
      body: UpdateDisplayReviewRequestDto;
    }) => updateDisplayReview(displayId, reviewId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(variables.displayId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.displays.reviewLists(variables.displayId),
      });
    },
  });
};

export const useDeleteDisplayReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ displayId, reviewId }: { displayId: number; reviewId: number }) =>
      deleteDisplayReview(displayId, reviewId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(variables.displayId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.displays.reviewLists(variables.displayId),
      });
    },
  });
};
