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

import { useUserMe } from './useUserProfile';

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
  /* 답글 생성 응답엔 프로필 사진이 없어, 내 프로필 사진으로 채워 넣습니다. */
  const { data: userMe } = useUserMe();

  return useMutation({
    mutationFn: (body: CreateDisplayReviewReplyRequestDto) =>
      createDisplayReviewReply(displayId, displayReviewId, body),
    /*
     * 답글은 오래된 순으로 쌓여서, 무효화 후 재조회하면 방금 쓴 답글이 다음 페이지로
     * 밀려나 "더보기"를 눌러야만 보입니다. 생성 응답은 목록 항목(user 중첩 객체 등)과
     * 모양이 달라, 새로 만든 답글이라는 사실로부터 확정되는 값으로 맞춰 캐시에 곧바로
     * 이어붙입니다.
     */
    onSuccess: (newReply) => {
      queryClient.setQueryData<InfiniteData<GetDisplayReviewRepliesResponseDataDto>>(
        queryKeys.displays.reviewReplies(displayId, displayReviewId),
        (old) => {
          if (!old || old.pages.length === 0) return old;
          const lastIndex = old.pages.length - 1;
          /* 마지막으로 불러온 페이지 뒤에 아직 서버에 더 가져올 페이지가 남아있으면,
           * 여기 이어붙였다가 다음 페이지를 커서로 조회할 때 항목이 중복될 수 있어 건너뜁니다. */
          if (old.pages[lastIndex].hasNext) return old;
          const fullReply = {
            displayReviewReplyId: newReply.displayReviewReplyId,
            content: newReply.content,
            createdAt: newReply.createdAt,
            user: {
              userId: newReply.userId,
              nickname: newReply.nickname,
              profileImageUrl: userMe?.profileImageUrl ?? null,
            },
            isTeamMember: newReply.isTeamMember,
            likeCount: 0,
            isLiked: false,
            images: newReply.images,
          };
          return {
            ...old,
            pages: old.pages.map((page, index) =>
              index === lastIndex ? { ...page, replies: [...page.replies, fullReply] } : page,
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
  const queryClient = useQueryClient();
  const invalidate = useInvalidateReplies(displayId, displayReviewId);
  const queryKey = queryKeys.displays.reviewReplies(displayId, displayReviewId);

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
    onMutate: async ({ displayReviewReplyId, liked }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData =
        queryClient.getQueryData<InfiniteData<GetDisplayReviewRepliesResponseDataDto>>(queryKey);

      queryClient.setQueryData<InfiniteData<GetDisplayReviewRepliesResponseDataDto>>(
        queryKey,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              replies: page.replies.map((reply) =>
                reply.displayReviewReplyId === displayReviewReplyId
                  ? {
                      ...reply,
                      isLiked: !liked,
                      likeCount: Math.max(reply.likeCount + (liked ? -1 : 1), 0),
                    }
                  : reply,
              ),
            })),
          };
        },
      );

      return { previousData };
    },
    onError: (_, __, context) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: invalidate,
  });
};
