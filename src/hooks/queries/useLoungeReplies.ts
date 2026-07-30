import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateLoungeReplyRequestDto, CursorPageRequestDto } from '@/api/dto';
import { createLoungeReply, getLoungeReplies } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useLoungeReplies = (commentId: number, params: CursorPageRequestDto = {}) =>
  useQuery({
    queryKey: queryKeys.loungeComments.replies(commentId, params),
    queryFn: () => getLoungeReplies(commentId, params),
    enabled: Number.isFinite(commentId),
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
