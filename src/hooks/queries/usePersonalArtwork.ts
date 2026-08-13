import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { PersonalArtworkRequestDto, PersonalArtworkResponseDataDto } from '@/api/dto';
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
  togglePersonalArtworkFeelingLike,
  togglePersonalArtworkFeelingReplyLike,
  togglePersonalArtworkQuestionLike,
  togglePersonalArtworkQuestionReplyLike,
  unlikePersonalArtwork,
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
    enabled: Number.isFinite(personalArtworkId),
  });

export const useCreatePersonalArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PersonalArtworkRequestDto) => createPersonalArtwork(body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.personalArtworks.lists() }),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.personalArtworks.lists() });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.personalArtworks.lists() });
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
    mutationFn: (content: string) => createPersonalArtworkFeeling(personalArtworkId, { content }),
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
  const invalidate = useInvalidatePersonalArtworkGuestbook(personalArtworkId);

  return useMutation({
    mutationFn: (personalFeelingId: number) =>
      togglePersonalArtworkFeelingLike(personalArtworkId, personalFeelingId),
    onSuccess: invalidate,
  });
};

export const useCreatePersonalArtworkFeelingReply = (
  personalArtworkId: number,
  personalFeelingId: number,
) => {
  const invalidate = useInvalidatePersonalArtworkGuestbook(personalArtworkId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) =>
      createPersonalArtworkFeelingReply(personalArtworkId, personalFeelingId, { content }),
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

  return useMutation({
    mutationFn: (personalFeelingReplyId: number) =>
      togglePersonalArtworkFeelingReplyLike(
        personalArtworkId,
        personalFeelingId,
        personalFeelingReplyId,
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [
          ...queryKeys.personalArtworks.detail(personalArtworkId),
          'feelings',
          personalFeelingId,
          'replies',
        ],
      }),
  });
};

export const useCreatePersonalArtworkQuestion = (personalArtworkId: number) => {
  const invalidate = useInvalidatePersonalArtworkGuestbook(personalArtworkId);

  return useMutation({
    mutationFn: ({ content, isPublic }: { content: string; isPublic: boolean }) =>
      createPersonalArtworkQuestion(personalArtworkId, { content, isPublic }),
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
  const invalidate = useInvalidatePersonalArtworkGuestbook(personalArtworkId);

  return useMutation({
    mutationFn: (personalQuestionId: number) =>
      togglePersonalArtworkQuestionLike(personalArtworkId, personalQuestionId),
    onSuccess: invalidate,
  });
};

export const useCreatePersonalArtworkQuestionReply = (
  personalArtworkId: number,
  personalQuestionId: number,
) => {
  const invalidate = useInvalidatePersonalArtworkGuestbook(personalArtworkId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) =>
      createPersonalArtworkQuestionReply(personalArtworkId, personalQuestionId, { content }),
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

  return useMutation({
    mutationFn: (personalQuestionReplyId: number) =>
      togglePersonalArtworkQuestionReplyLike(
        personalArtworkId,
        personalQuestionId,
        personalQuestionReplyId,
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [
          ...queryKeys.personalArtworks.detail(personalArtworkId),
          'questions',
          personalQuestionId,
          'reply',
        ],
      }),
  });
};
