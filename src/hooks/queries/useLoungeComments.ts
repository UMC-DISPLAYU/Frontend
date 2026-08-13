import type { InfiniteData, QueryKey } from '@tanstack/react-query';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  CreateLoungeCommentRequestDto,
  CursorPageRequestDto,
  LoungeCommentDto,
  LoungeReplyDto,
} from '@/api/dto';
import {
  createLoungeComment,
  deleteLoungeComment,
  getLoungeComments,
  likeLoungeComment,
  unlikeLoungeComment,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

type LoungeCommentPage = { comments?: LoungeCommentDto[]; replies?: LoungeReplyDto[] };

const toggleLoungeCommentLike = <T extends { loungeCommentId: number; isLiked: boolean; likeCount: number }>(
  items: T[] | undefined,
  commentId: number,
  liked: boolean,
) =>
  items?.map((item) =>
    item.loungeCommentId === commentId
      ? { ...item, isLiked: liked, likeCount: Math.max(item.likeCount + (liked ? 1 : -1), 0) }
      : item,
  );

export const useLoungeComments = (
  postId: number,
  params: Omit<CursorPageRequestDto, 'cursorId'> = {},
) =>
  useInfiniteQuery({
    queryKey: queryKeys.loungeComments.list(postId, params),
    queryFn: ({ pageParam }) =>
      getLoungeComments(postId, { ...params, cursorId: pageParam ?? undefined }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursorId : null),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.loungePosts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.loungeMe.all });
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
      queryClient.invalidateQueries({
        queryKey: queryKeys.loungeComments.listPrefix(variables.postId),
      });
      if (variables.parentCommentId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.loungeComments.replyLists(variables.parentCommentId),
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.loungePosts.detail(variables.postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.loungePosts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.loungeMe.all });
    },
  });
};

const useLikeLoungeCommentMutation = (liked: boolean, mutationFn: (commentId: number) => Promise<unknown>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: CommentMutationVariables) => mutationFn(variables.commentId),
    onMutate: async (variables) => {
      const targetKey: QueryKey = variables.parentCommentId
        ? queryKeys.loungeComments.replyLists(variables.parentCommentId)
        : queryKeys.loungeComments.listPrefix(variables.postId);

      await queryClient.cancelQueries({ queryKey: targetKey });

      const previousQueries = queryClient.getQueriesData<InfiniteData<LoungeCommentPage>>({
        queryKey: targetKey,
      });

      queryClient.setQueriesData<InfiniteData<LoungeCommentPage>>({ queryKey: targetKey }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            comments: toggleLoungeCommentLike(page.comments, variables.commentId, liked),
            replies: toggleLoungeCommentLike(page.replies, variables.commentId, liked),
          })),
        };
      });

      return { previousQueries };
    },
    onError: (_, __, context) => {
      context?.previousQueries.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: (_, __, variables) => {
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

export const useLikeLoungeComment = () => useLikeLoungeCommentMutation(true, likeLoungeComment);

export const useUnlikeLoungeComment = () => useLikeLoungeCommentMutation(false, unlikeLoungeComment);
