import type { InfiniteData } from '@tanstack/react-query';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  ArtworkFeelingReplyImageRequestDto,
  ArtworkFeelingReplyListResponseDataDto,
  CreateArtworkFeelingRequestDto,
  UpdateArtworkFeelingRequestDto,
} from '@/api/dto';
import {
  createArtworkFeeling,
  createArtworkFeelingReply,
  deleteArtworkFeeling,
  deleteArtworkFeelingReply,
  getArtworkFeelingReplies,
  getArtworkFeelings,
  likeArtworkFeeling,
  likeArtworkFeelingReply,
  unlikeArtworkFeeling,
  unlikeArtworkFeelingReply,
  updateArtworkFeeling,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

import { useUserMe } from './useUserProfile';

export const useArtworkFeelings = (artworkId: number) =>
  useInfiniteQuery({
    queryKey: queryKeys.artworkFeelings.list(artworkId),
    queryFn: ({ pageParam }) => getArtworkFeelings(artworkId, { cursorId: pageParam ?? undefined }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursorId : null),
    enabled: Number.isFinite(artworkId) && artworkId > 0,
  });

export const useCreateArtworkFeeling = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      artworkId,
      body,
    }: {
      artworkId: number;
      body: CreateArtworkFeelingRequestDto;
    }) => createArtworkFeeling(artworkId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.artworkFeelings.list(variables.artworkId),
      });
    },
  });
};

export const useUpdateArtworkFeeling = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      artworkId,
      feelingId,
      body,
    }: {
      artworkId: number;
      feelingId: number;
      body: UpdateArtworkFeelingRequestDto;
    }) => updateArtworkFeeling(artworkId, feelingId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.artworkFeelings.list(variables.artworkId),
      });
    },
  });
};

export const useDeleteArtworkFeeling = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ artworkId, feelingId }: { artworkId: number; feelingId: number }) =>
      deleteArtworkFeeling(artworkId, feelingId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.artworkFeelings.list(variables.artworkId),
      });
    },
  });
};

export const useToggleArtworkFeelingLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      artworkId,
      feelingId,
      liked,
    }: {
      artworkId: number;
      feelingId: number;
      liked: boolean;
    }) =>
      liked ? unlikeArtworkFeeling(artworkId, feelingId) : likeArtworkFeeling(artworkId, feelingId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.artworkFeelings.list(variables.artworkId),
      });
    },
  });
};

export const useArtworkFeelingReplies = (artworkId: number, feelingId: number, enabled = true) =>
  useInfiniteQuery({
    queryKey: queryKeys.artworkFeelings.replies(artworkId, feelingId),
    queryFn: ({ pageParam }) =>
      getArtworkFeelingReplies(artworkId, feelingId, { cursorId: pageParam ?? undefined }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursorId : null),
    enabled: enabled && Number.isFinite(artworkId) && Number.isFinite(feelingId),
  });

/* 답글이 바뀌면 감상 목록의 답글 수도 함께 갱신되어야 합니다. */
const useInvalidateFeelingReplies = (artworkId: number, feelingId: number) => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.artworkFeelings.replies(artworkId, feelingId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.artworkFeelings.list(artworkId),
      exact: true,
    });
  };
};

export const useCreateArtworkFeelingReply = (artworkId: number, feelingId: number) => {
  const queryClient = useQueryClient();
  /* 답글 생성 응답엔 프로필 사진이 없어, 내 프로필 사진으로 채워 넣습니다. */
  const { data: userMe } = useUserMe();

  return useMutation({
    mutationFn: ({
      content,
      images,
    }: {
      content: string;
      images?: ArtworkFeelingReplyImageRequestDto[];
    }) => createArtworkFeelingReply(artworkId, feelingId, { content, images }),
    /*
     * 답글은 오래된 순으로 쌓여서, 무효화 후 재조회하면 방금 쓴 답글이 다음 페이지로
     * 밀려나 "더보기"를 눌러야만 보입니다. 생성 응답은 목록 항목(user 중첩 객체 등)과
     * 모양이 달라, 새로 만든 답글이라는 사실로부터 확정되는 값으로 맞춰 캐시에 곧바로
     * 이어붙입니다.
     */
    onSuccess: (newReply) => {
      queryClient.setQueryData<InfiniteData<ArtworkFeelingReplyListResponseDataDto>>(
        queryKeys.artworkFeelings.replies(artworkId, feelingId),
        (old) => {
          if (!old || old.pages.length === 0) return old;
          const lastIndex = old.pages.length - 1;
          /* 마지막으로 불러온 페이지 뒤에 아직 서버에 더 가져올 페이지가 남아있으면,
           * 여기 이어붙였다가 다음 페이지를 커서로 조회할 때 항목이 중복될 수 있어 건너뜁니다. */
          if (old.pages[lastIndex].hasNext) return old;
          const fullReply = {
            feelingReplyId: newReply.feelingReplyId,
            content: newReply.content,
            createdAt: newReply.createdAt,
            user: {
              userId: newReply.userId,
              nickname: newReply.nickname,
              profileImageUrl: userMe?.profileImageUrl,
            },
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
      queryClient.invalidateQueries({
        queryKey: queryKeys.artworkFeelings.list(artworkId),
        exact: true,
      });
    },
  });
};

export const useDeleteArtworkFeelingReply = (artworkId: number, feelingId: number) => {
  const invalidate = useInvalidateFeelingReplies(artworkId, feelingId);

  return useMutation({
    mutationFn: (feelingReplyId: number) =>
      deleteArtworkFeelingReply(artworkId, feelingId, feelingReplyId),
    onSuccess: invalidate,
  });
};

export const useToggleArtworkFeelingReplyLike = (artworkId: number, feelingId: number) => {
  const invalidate = useInvalidateFeelingReplies(artworkId, feelingId);

  return useMutation({
    mutationFn: ({ feelingReplyId, liked }: { feelingReplyId: number; liked: boolean }) =>
      liked
        ? unlikeArtworkFeelingReply(artworkId, feelingId, feelingReplyId)
        : likeArtworkFeelingReply(artworkId, feelingId, feelingReplyId),
    onSuccess: invalidate,
  });
};
