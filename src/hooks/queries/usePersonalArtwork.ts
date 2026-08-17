import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  GetPersonalArtworkFeelingsResponseDataDto,
  GetPersonalArtworkQuestionReplyResponseDataDto,
  GetPersonalArtworkQuestionsResponseDataDto,
  PersonalArtworkFeelingImageRequestDto,
  PersonalArtworkFeelingReplyListResponseDataDto,
  PersonalArtworkRequestDto,
  PersonalArtworkResponseDataDto,
} from '@/api/dto';
import {
  createPersonalArtwork,
  createPersonalArtworkFeeling,
  createPersonalArtworkFeelingReply,
  createPersonalArtworkQuestion,
  createPersonalArtworkQuestionReply,
  deletePersonalArtwork,
  deletePersonalArtworkFeeling,
  deletePersonalArtworkFeelingReply,
  deletePersonalArtworkQuestion,
  deletePersonalArtworkQuestionReply,
  getPersonalArtwork,
  getPersonalArtworkFeelingReplies,
  getPersonalArtworkFeelings,
  getPersonalArtworkQuestionReply,
  getPersonalArtworkQuestions,
  getPersonalArtworks,
  likePersonalArtwork,
  likePersonalArtworkFeeling,
  likePersonalArtworkFeelingReply,
  togglePersonalArtworkQuestionLike,
  togglePersonalArtworkQuestionReplyLike,
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
      queryKey: [...queryKeys.personalArtworks.detail(personalArtworkId), 'questions'],
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.artworkFeelings.all,
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.artworkQuestions.all,
    });
  };
};

export const usePersonalArtworkFeelings = (personalArtworkId: number) =>
  useQuery({
    queryKey: [...queryKeys.personalArtworks.detail(personalArtworkId), 'feelings'],
    queryFn: () => getPersonalArtworkFeelings(personalArtworkId),
    enabled: Number.isFinite(personalArtworkId) && personalArtworkId > 0,
  });

export const usePersonalArtworkQuestions = (personalArtworkId: number) =>
  useQuery({
    queryKey: [...queryKeys.personalArtworks.detail(personalArtworkId), 'questions'],
    queryFn: () => getPersonalArtworkQuestions(personalArtworkId),
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

export const usePersonalArtworkQuestionReply = (
  personalArtworkId: number,
  personalQuestionId: number,
) =>
  useQuery({
    queryKey: [
      ...queryKeys.personalArtworks.detail(personalArtworkId),
      'questions',
      personalQuestionId,
      'reply',
    ],
    queryFn: () => getPersonalArtworkQuestionReply(personalArtworkId, personalQuestionId),
    enabled:
      Number.isFinite(personalArtworkId) &&
      personalArtworkId > 0 &&
      Number.isFinite(personalQuestionId) &&
      personalQuestionId > 0,
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

export const useCreatePersonalArtworkQuestion = (personalArtworkId: number) => {
  const invalidate = useInvalidatePersonalArtworkGuestbook(personalArtworkId);

  return useMutation({
    mutationFn: ({
      content,
      isPublic,
      images,
    }: {
      content: string;
      isPublic: boolean;
      images?: PersonalArtworkFeelingImageRequestDto[];
    }) => createPersonalArtworkQuestion(personalArtworkId, { content, isPublic, images }),
    onSuccess: invalidate,
  });
};

export const useDeletePersonalArtworkQuestion = (personalArtworkId: number) => {
  const invalidate = useInvalidatePersonalArtworkGuestbook(personalArtworkId);

  return useMutation({
    mutationFn: (personalQuestionId: number) =>
      deletePersonalArtworkQuestion(personalArtworkId, personalQuestionId),
    onSuccess: invalidate,
  });
};

export const useTogglePersonalArtworkQuestionLike = (personalArtworkId: number) => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidatePersonalArtworkGuestbook(personalArtworkId);
  const queryKey = [...queryKeys.personalArtworks.detail(personalArtworkId), 'questions'];

  return useMutation({
    mutationFn: (personalQuestionId: number) =>
      togglePersonalArtworkQuestionLike(personalArtworkId, personalQuestionId),
    onMutate: async (personalQuestionId) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData =
        queryClient.getQueryData<GetPersonalArtworkQuestionsResponseDataDto>(queryKey);

      queryClient.setQueryData<GetPersonalArtworkQuestionsResponseDataDto>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          questions: old.questions.map((question) =>
            question.personalQuestionId === personalQuestionId
              ? {
                  ...question,
                  isLiked: !question.isLiked,
                  likeCount: Math.max((question.likeCount ?? 0) + (question.isLiked ? -1 : 1), 0),
                }
              : question,
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

export const useCreatePersonalArtworkQuestionReply = (
  personalArtworkId: number,
  personalQuestionId: number,
) => {
  const invalidate = useInvalidatePersonalArtworkGuestbook(personalArtworkId);

  return useMutation({
    mutationFn: ({
      content,
      images,
    }: {
      content: string;
      images?: PersonalArtworkFeelingImageRequestDto[];
    }) =>
      createPersonalArtworkQuestionReply(personalArtworkId, personalQuestionId, {
        content,
        images,
      }),
    onSuccess: invalidate,
  });
};

export const useDeletePersonalArtworkQuestionReply = (
  personalArtworkId: number,
  personalQuestionId: number,
) => {
  const invalidate = useInvalidatePersonalArtworkGuestbook(personalArtworkId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (personalQuestionReplyId: number) =>
      deletePersonalArtworkQuestionReply(
        personalArtworkId,
        personalQuestionId,
        personalQuestionReplyId,
      ),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({
        queryKey: [
          ...queryKeys.personalArtworks.detail(personalArtworkId),
          'questions',
          personalQuestionId,
          'reply',
        ],
      });
    },
  });
};

export const useTogglePersonalArtworkQuestionReplyLike = (
  personalArtworkId: number,
  personalQuestionId: number,
) => {
  const queryClient = useQueryClient();
  const queryKey = [
    ...queryKeys.personalArtworks.detail(personalArtworkId),
    'questions',
    personalQuestionId,
    'reply',
  ];

  return useMutation({
    mutationFn: (personalQuestionReplyId: number) =>
      togglePersonalArtworkQuestionReplyLike(
        personalArtworkId,
        personalQuestionId,
        personalQuestionReplyId,
      ),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousData =
        queryClient.getQueryData<GetPersonalArtworkQuestionReplyResponseDataDto>(queryKey);

      queryClient.setQueryData<GetPersonalArtworkQuestionReplyResponseDataDto>(queryKey, (old) =>
        old
          ? {
              ...old,
              isLiked: !old.isLiked,
              likeCount: Math.max((old.likeCount ?? 0) + (old.isLiked ? -1 : 1), 0),
            }
          : old,
      );

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
