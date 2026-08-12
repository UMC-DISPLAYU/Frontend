import type { InfiniteData } from '@tanstack/react-query';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  CreateDisplayReviewReplyRequestDto,
  GetDisplayReviewRepliesResponseDataDto,
} from '@/api/dto';
import {
  cancelDisplayReviewReplyLike,
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateDisplayReviewReplyRequestDto) =>
      createDisplayReviewReply(displayId, displayReviewId, body),
    /*
     * 답글은 오래된 순으로 쌓여서, 무효화 후 재조회하면 방금 쓴 답글이 다음 페이지로
     * 밀려나 "더보기"를 눌러야만 보입니다. 생성 응답이 목록 항목과 동일한 모양이라
     * 캐시에 곧바로 이어붙여 작성자 본인에게는 즉시 보이게 합니다.
     */
    onSuccess: (newReply) => {
      queryClient.setQueryData<InfiniteData<GetDisplayReviewRepliesResponseDataDto>>(
        queryKeys.displays.reviewReplies(displayId, displayReviewId),
        (old) => {
          if (!old || old.pages.length === 0) return old;
          const lastIndex = old.pages.length - 1;
          return {
            ...old,
            pages: old.pages.map((page, index) =>
              index === lastIndex ? { ...page, replies: [...page.replies, newReply] } : page,
            ),
          };
        },
      );
      /* 답글 수 표시를 위해 후기 목록만 갱신합니다(답글 목록은 위에서 직접 갱신했으므로 제외). */
      queryClient.invalidateQueries({
        queryKey: queryKeys.displays.reviews(displayId),
        exact: true,
      });
    },
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
    mutationFn: ({
      displayReviewReplyId,
      liked,
    }: {
      displayReviewReplyId: number;
      liked: boolean;
    }) =>
      liked
        ? cancelDisplayReviewReplyLike(displayId, displayReviewId, displayReviewReplyId)
        : toggleDisplayReviewReplyLike(displayId, displayReviewId, displayReviewReplyId),
    onSuccess: invalidate,
  });
};
