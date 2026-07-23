import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  CreateLoungeCommentRequestDto,
  CursorPageRequestDto,
  UpdateLoungeCommentRequestDto,
} from '@/api/dto';
import {
  createLoungeComment,
  deleteLoungeComment,
  getLoungeComments,
  likeLoungeComment,
  unlikeLoungeComment,
  updateLoungeComment,
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

export const useUpdateLoungeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      body,
    }: {
      postId: number;
      commentId: number;
      body: UpdateLoungeCommentRequestDto;
    }) => updateLoungeComment(commentId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.loungeComments.listPrefix(variables.postId),
      });
    },
  });
};

export const useDeleteLoungeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: { postId: number; commentId: number }) =>
      deleteLoungeComment(commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.loungeComments.listPrefix(variables.postId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.loungePosts.detail(variables.postId) });
    },
  });
};

export const useLikeLoungeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: { postId: number; commentId: number }) =>
      likeLoungeComment(commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.loungeComments.listPrefix(variables.postId),
      });
    },
  });
};

export const useUnlikeLoungeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: { postId: number; commentId: number }) =>
      unlikeLoungeComment(commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.loungeComments.listPrefix(variables.postId),
      });
    },
  });
};
