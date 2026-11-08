import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  GetPersonalArtworkFeelingsResponseDataDto,
  PersonalArtworkFeelingImageRequestDto,
  PersonalArtworkFeelingReplyListResponseDataDto,
  PersonalArtworkRequestDto,
  PersonalArtworkResponseDataDto,
} from '@/api/dto';
import {
  createPersonalArtwork,
  createPersonalArtworkFeeling,
  createPersonalArtworkFeelingReply,
  deletePersonalArtwork,
  deletePersonalArtworkFeeling,
  deletePersonalArtworkFeelingReply,
  getPersonalArtwork,
  getPersonalArtworkFeelingReplies,
  getPersonalArtworkFeelings,
  getPersonalArtworks,
  likePersonalArtwork,
  likePersonalArtworkFeeling,
  likePersonalArtworkFeelingReply,
  unlikePersonalArtwork,
  unlikePersonalArtworkFeeling,
  unlikePersonalArtworkFeelingReply,
  updatePersonalArtwork,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const usePersonalArtworks = (userId: number) =>
  useQuery({
    queryKey: [...queryKeys.personalArtworks.list(), userId],
    queryFn: () => getPersonalArtworks(userId),
    enabled: Number.isFinite(userId) && userId > 0,
  });

export const usePersonalArtwork = (personalArtworkId: number) =>
  useQuery({
    queryKey: queryKeys.personalArtworks.detail(personalArtworkId),
    queryFn: () => getPersonalArtwork(personalArtworkId),
    enabled: Number.isFinite(personalArtworkId) && personalArtworkId > 0,
  });

const invalidatePersonalArtworkLists = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.personalArtworks.lists() });
  queryClient.invalidateQueries({ queryKey: queryKeys.displayArtworks.me() });
  queryClient.invalidateQueries({ queryKey: queryKeys.displayArtworks.lists() });
};

export const useCreatePersonalArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PersonalArtworkRequestDto) => createPersonalArtwork(body),
    onSuccess: () => invalidatePersonalArtworkLists(queryClient),
  });
};

export const useUpdatePersonalArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      personalArtworkId,
      body,
    }: {
      personalArtworkId: number;
      body: Partial<PersonalArtworkRequestDto>;
    }) => updatePersonalArtwork(personalArtworkId, body),
    onSuccess: (_, variables) => {
      invalidatePersonalArtworkLists(queryClient);
      queryClient.invalidateQueries({
        queryKey: queryKeys.personalArtworks.detail(variables.personalArtworkId),
      });
    },
  });
};

export const useDeletePersonalArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (personalArtworkId: number) => deletePersonalArtwork(personalArtworkId),
    onSuccess: (_, personalArtworkId) => {
      invalidatePersonalArtworkLists(queryClient);
      queryClient.removeQueries({
        queryKey: queryKeys.personalArtworks.detail(personalArtworkId),
      });
    },
  });
};

export const useTogglePersonalArtworkLike = (personalArtworkId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (liked: boolean) =>
      liked ? unlikePersonalArtwork(personalArtworkId) : likePersonalArtwork(personalArtworkId),
    onSuccess: ({ isLiked, likeCount }) => {
      queryClient.setQueryData<PersonalArtworkResponseDataDto>(
        queryKeys.personalArtworks.detail(personalArtworkId),
        (current) => (current ? { ...current, isLiked, likeCount } : current),
      );
    },
  });
};

const useInvalidatePersonalArtworkGuestbook = (personalArtworkId: number) => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: [...queryKeys.personalArtworks.detail(personalArtworkId), 'feelings'],
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.artworkFeelings.all,
    });
  };
};

export const usePersonalArtworkFeelings = (personalArtworkId: number) =>
  useQuery({
    queryKey: [...queryKeys.personalArtworks.detail(personalArtworkId), 'feelings'],
    queryFn: () => getPersonalArtworkFeelings(personalArtworkId),
    enabled: Number.isFinite(personalArtworkId) && personalArtworkId > 0,
  });

export const usePersonalArtworkFeelingReplies = (
  personalArtworkId: number,
  personalFeelingId: number,
  enabled = true,
) =>
  useQuery({
    queryKey: [
      ...queryKeys.personalArtworks.detail(personalArtworkId),
      'feelings',
      personalFeelingId,
      'replies',
    ],
    queryFn: () => getPersonalArtworkFeelingReplies(personalArtworkId, personalFeelingId),
    enabled:
      enabled &&
      Number.isFinite(personalArtworkId) &&
      personalArtworkId > 0 &&
      Number.isFinite(personalFeelingId) &&
      personalFeelingId > 0,
  });

export const useCreatePersonalArtworkFeeling = (personalArtworkId: number) => {
  const invalidate = useInvalidatePersonalArtworkGuestbook(personalArtworkId);

  return useMutation({
    mutationFn: ({
      content,
      images,
    }: {
      content: string;
      images?: PersonalArtworkFeelingImageRequestDto[];
    }) => createPersonalArtworkFeeling(personalArtworkId, { content, images }),
    onSuccess: invalidate,
  });
};

export const useDeletePersonalArtworkFeeling = (personalArtworkId: number) => {
  const invalidate = useInvalidatePersonalArtworkGuestbook(personalArtworkId);

  return useMutation({
    mutationFn: (personalFeelingId: number) =>
      deletePersonalArtworkFeeling(personalArtworkId, personalFeelingId),
    onSuccess: invalidate,
  });
};

export const useTogglePersonalArtworkFeelingLike = (personalArtworkId: number) => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidatePersonalArtworkGuestbook(personalArtworkId);
  const queryKey = [...queryKeys.personalArtworks.detail(personalArtworkId), 'feelings'];

  return useMutation({
    mutationFn: ({ personalFeelingId, liked }: { personalFeelingId: number; liked: boolean }) =>
      liked
        ? unlikePersonalArtworkFeeling(personalArtworkId, personalFeelingId)
        : likePersonalArtworkFeeling(personalArtworkId, personalFeelingId),
    onMutate: async ({ personalFeelingId }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData =
        queryClient.getQueryData<GetPersonalArtworkFeelingsResponseDataDto>(queryKey);

      queryClient.setQueryData<GetPersonalArtworkFeelingsResponseDataDto>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          feelings: old.feelings.map((feeling) =>
            feeling.personalFeelingId === personalFeelingId
              ? {
                  ...feeling,
                  isLiked: !feeling.isLiked,
                  likeCount: Math.max((feeling.likeCount ?? 0) + (feeling.isLiked ? -1 : 1), 0),
                }
              : feeling,
          ),
        };
      });

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

export const useCreatePersonalArtworkFeelingReply = (
  personalArtworkId: number,
  personalFeelingId: number,
) => {
  const invalidate = useInvalidatePersonalArtworkGuestbook(personalArtworkId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      content,
      images,
    }: {
      content: string;
      images?: PersonalArtworkFeelingImageRequestDto[];
    }) =>
      createPersonalArtworkFeelingReply(personalArtworkId, personalFeelingId, {
        content,
        images,
      }),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({
        queryKey: [
          ...queryKeys.personalArtworks.detail(personalArtworkId),
          'feelings',
          personalFeelingId,
          'replies',
        ],
      });
    },
  });
};

export const useDeletePersonalArtworkFeelingReply = (
  personalArtworkId: number,
  personalFeelingId: number,
) => {
  const invalidate = useInvalidatePersonalArtworkGuestbook(personalArtworkId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (personalFeelingReplyId: number) =>
      deletePersonalArtworkFeelingReply(
        personalArtworkId,
        personalFeelingId,
        personalFeelingReplyId,
      ),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({
        queryKey: [
          ...queryKeys.personalArtworks.detail(personalArtworkId),
          'feelings',
          personalFeelingId,
          'replies',
        ],
      });
    },
  });
};

export const useTogglePersonalArtworkFeelingReplyLike = (
  personalArtworkId: number,
  personalFeelingId: number,
) => {
  const queryClient = useQueryClient();
  const queryKey = [
    ...queryKeys.personalArtworks.detail(personalArtworkId),
    'feelings',
    personalFeelingId,
    'replies',
  ];

  return useMutation({
    mutationFn: ({
      personalFeelingReplyId,
      liked,
    }: {
      personalFeelingReplyId: number;
      liked: boolean;
    }) =>
      liked
        ? unlikePersonalArtworkFeelingReply(
            personalArtworkId,
            personalFeelingId,
            personalFeelingReplyId,
          )
        : likePersonalArtworkFeelingReply(
            personalArtworkId,
            personalFeelingId,
            personalFeelingReplyId,
          ),
    onMutate: async ({ personalFeelingReplyId }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData =
        queryClient.getQueryData<PersonalArtworkFeelingReplyListResponseDataDto>(queryKey);

      queryClient.setQueryData<PersonalArtworkFeelingReplyListResponseDataDto>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          replies: old.replies.map((reply) =>
            reply.personalFeelingReplyId === personalFeelingReplyId
              ? {
                  ...reply,
                  isLiked: !reply.isLiked,
                  likeCount: Math.max((reply.likeCount ?? 0) + (reply.isLiked ? -1 : 1), 0),
                }
              : reply,
          ),
        };
      });

      return { previousData };
    },
    onError: (_, __, context) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
};
