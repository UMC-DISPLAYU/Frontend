import type { InfiniteData } from '@tanstack/react-query';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  CreateLoungeReplyRequestDto,
  CursorPageRequestDto,
  GetLoungeRepliesResponseDataDto,
} from '@/api/dto';
import { createLoungeReply, getLoungeReplies } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useLoungeReplies = (
  commentId: number,
  params: Omit<CursorPageRequestDto, 'cursorId'> = {},
  options: { enabled?: boolean } = {},
) =>
  useInfiniteQuery({
    queryKey: queryKeys.loungeComments.replies(commentId, params),
    queryFn: ({ pageParam }) =>
      getLoungeReplies(commentId, { ...params, cursorId: pageParam ?? undefined }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursorId : null),
    enabled: Number.isFinite(commentId) && (options.enabled ?? true),
  });

export const useCreateLoungeReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      body,
    }: {
      postId: number;
      commentId: number;
      body: CreateLoungeReplyRequestDto;
    }) => createLoungeReply(commentId, body),
    /*
     * 답글은 오래된 순으로 쌓여서, 무효화 후 재조회하면 방금 쓴 답글이 다음 페이지로
     * 밀려나 "더보기"를 눌러야만 보입니다. 생성 응답에 목록 항목이 요구하는 몇몇 필드
     * (updatedAt, likeCount, isLiked, isMyComment)가 빠져 있어, 새로 만든 답글이라는
     * 사실로부터 확정되는 기본값으로 채워 캐시에 곧바로 이어붙입니다.
     */
    onSuccess: (newReply, variables) => {
      queryClient.setQueryData<InfiniteData<GetLoungeRepliesResponseDataDto>>(
        queryKeys.loungeComments.replies(variables.commentId, {}),
        (old) => {
          if (!old || old.pages.length === 0) return old;
          const lastIndex = old.pages.length - 1;
          const fullReply = {
            ...newReply,
            updatedAt: newReply.createdAt,
            likeCount: 0,
            isLiked: false,
            isMyComment: true,
          };
          return {
            ...old,
            pages: old.pages.map((page, index) =>
              index === lastIndex ? { ...page, replies: [...page.replies, fullReply] } : page,
            ),
          };
        },
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.loungeComments.listPrefix(variables.postId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.loungePosts.detail(variables.postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.loungePosts.lists() });
    },
  });
};
