import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateLoungeCommentRequestDto, CursorPageRequestDto } from '@/api/dto';
import {
  createLoungeComment,
  deleteLoungeComment,
  getLoungeComments,
  likeLoungeComment,
  unlikeLoungeComment,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useLoungeComments = (postId: number, params: CursorPageRequestDto = {}) =>
  useQuery({
    queryKey: queryKeys.loungeComments.list(postId, params),
    queryFn: () => getLoungeComments(postId, params),
    enabled: Number.isFinite(postId),
  });

export const useCreateLoungeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, body }: { postId: number; body: CreateLoungeCommentRequestDto }) =>
      createLoungeComment(postId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.loungeComments.listPrefix(variables.postId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.loungePosts.detail(variables.postId) });
    },
  });
};

type CommentMutationVariables = {
  postId: number;
  commentId: number;
  parentCommentId?: number;
};

export const useDeleteLoungeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: CommentMutationVariables) => deleteLoungeComment(commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loungePosts.detail(variables.postId) });
    },
  });
};

export const useLikeLoungeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: CommentMutationVariables) => likeLoungeComment(commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.loungeComments.listPrefix(variables.postId),
      });
      if (variables.parentCommentId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.loungeComments.replyLists(variables.parentCommentId),
        });
      }
    },
  });
};

export const useUnlikeLoungeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: CommentMutationVariables) => unlikeLoungeComment(commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.loungeComments.listPrefix(variables.postId),
      });
      if (variables.parentCommentId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.loungeComments.replyLists(variables.parentCommentId),
        });
      }
    },
  });
};
