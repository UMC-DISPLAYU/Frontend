import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateDisplayReviewReplyRequestDto } from '@/api/dto';
import {
  createDisplayReviewReply,
  deleteDisplayReviewReply,
  getDisplayReviewReplies,
  toggleDisplayReviewReplyLike,
} from '@/api/endpoints';
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

/* 답글이 바뀌면 후기 목록의 replyCount도 함께 갱신되어야 합니다. */
const useInvalidateReplies = (displayId: number, displayReviewId: number) => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.displays.reviewReplies(displayId, displayReviewId),
    });
    /*
     * 답글 키가 후기 키를 접두사로 포함하므로 exact를 주지 않으면
     * 후기 목록을 무효화할 때 답글 목록까지 다시 조회됩니다.
     */
    queryClient.invalidateQueries({ queryKey: queryKeys.displays.reviews(displayId), exact: true });
  };
};

export const useCreateDisplayReviewReply = (displayId: number, displayReviewId: number) => {
  const invalidate = useInvalidateReplies(displayId, displayReviewId);

  return useMutation({
    mutationFn: (body: CreateDisplayReviewReplyRequestDto) =>
      createDisplayReviewReply(displayId, displayReviewId, body),
    onSuccess: invalidate,
  });
};

export const useDeleteDisplayReviewReply = (displayId: number, displayReviewId: number) => {
  const invalidate = useInvalidateReplies(displayId, displayReviewId);

  return useMutation({
    mutationFn: (displayReviewReplyId: number) =>
      deleteDisplayReviewReply(displayId, displayReviewId, displayReviewReplyId),
    onSuccess: invalidate,
  });
};

export const useToggleDisplayReviewReplyLike = (displayId: number, displayReviewId: number) => {
  const invalidate = useInvalidateReplies(displayId, displayReviewId);

  return useMutation({
    mutationFn: (displayReviewReplyId: number) =>
      toggleDisplayReviewReplyLike(displayId, displayReviewId, displayReviewReplyId),
    onSuccess: invalidate,
  });
};
