import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateLoungeReplyRequestDto, CursorPageRequestDto } from '@/api/dto';
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.loungeComments.replyLists(variables.commentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.loungeComments.listPrefix(variables.postId),
      });
    },
  });
};
