import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  CreateLoungePostRequestDto,
  GetLoungePostsRequestDto,
  UpdateLoungePostRequestDto,
} from '@/api/dto';
import {
  createLoungePost,
  deleteLoungePost,
  getLoungePostDetail,
  getLoungePosts,
  likeLoungePost,
  scrapLoungePost,
  unlikeLoungePost,
  unscrapLoungePost,
  updateLoungePost,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

const DEFAULT_LOUNGE_POSTS_SIZE = 20;

export const useLoungePosts = (
  params: Omit<GetLoungePostsRequestDto, 'cursorId'> = {},
  options: { enabled?: boolean } = {},
) =>
  useInfiniteQuery({
    queryKey: queryKeys.loungePosts.list(params),
    queryFn: ({ pageParam }) =>
      getLoungePosts({
        ...params,
        cursorId: pageParam,
        size: params.size ?? DEFAULT_LOUNGE_POSTS_SIZE,
      }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursorId : null),
    enabled: options.enabled ?? true,
  });

export const useLoungePostDetail = (postId: number) =>
  useQuery({
    queryKey: queryKeys.loungePosts.detail(postId),
    queryFn: () => getLoungePostDetail(postId),
    enabled: Number.isFinite(postId),
  });

export const useCreateLoungePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateLoungePostRequestDto) => createLoungePost(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loungePosts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.loungeMe.all });
    },
  });
};

export const useUpdateLoungePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, body }: { postId: number; body: UpdateLoungePostRequestDto }) =>
      updateLoungePost(postId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loungePosts.detail(variables.postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.loungePosts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.loungeMe.all });
    },
  });
};

export const useDeleteLoungePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => deleteLoungePost(postId),
    onSuccess: (_, postId) => {
      queryClient.removeQueries({ queryKey: queryKeys.loungePosts.detail(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.loungePosts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.loungeMe.all });
    },
  });
};

export const useLikeLoungePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => likeLoungePost(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loungePosts.detail(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.loungePosts.lists() });
    },
  });
};

export const useUnlikeLoungePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => unlikeLoungePost(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loungePosts.detail(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.loungePosts.lists() });
    },
  });
};

export const useScrapLoungePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => scrapLoungePost(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loungePosts.detail(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.loungePosts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.loungeMe.all });
    },
  });
};

export const useUnscrapLoungePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => unscrapLoungePost(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loungePosts.detail(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.loungePosts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.loungeMe.all });
    },
  });
};
