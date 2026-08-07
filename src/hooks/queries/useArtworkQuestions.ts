import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  CreateArtworkQuestionReplyRequestDto,
  CreateArtworkQuestionRequestDto,
  GetMyArtworkQuestionsRequestDto,
  UpdateArtworkQuestionRequestDto,
} from '@/api/dto';
import {
  createArtworkQuestion,
  createArtworkQuestionReply,
  deleteArtworkQuestion,
  deleteArtworkQuestionReply,
  getArtworkQuestions,
  getMyArtworkQuestions,
  updateArtworkQuestion,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useArtworkQuestions = (artworkId: number) =>
  useQuery({
    queryKey: queryKeys.artworkQuestions.list(artworkId),
    queryFn: () => getArtworkQuestions(artworkId),
    enabled: Number.isFinite(artworkId),
  });

export const useMyArtworkQuestions = (params: GetMyArtworkQuestionsRequestDto) =>
  useQuery({
    queryKey: queryKeys.artworkQuestions.me(),
    queryFn: () => getMyArtworkQuestions(),
  });

export const useCreateArtworkQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      artworkId,
      body,
    }: {
      artworkId: number;
      body: CreateArtworkQuestionRequestDto;
    }) => createArtworkQuestion(artworkId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.artworkQuestions.list(variables.artworkId),
      });
    },
  });
};

export const useUpdateArtworkQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      artworkId,
      questionId,
      body,
    }: {
      artworkId: number;
      questionId: number;
      body: UpdateArtworkQuestionRequestDto;
    }) => updateArtworkQuestion(artworkId, questionId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.artworkQuestions.list(variables.artworkId),
      });
    },
  });
};

export const useDeleteArtworkQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ artworkId, questionId }: { artworkId: number; questionId: number }) =>
      deleteArtworkQuestion(artworkId, questionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.artworkQuestions.list(variables.artworkId),
      });
    },
  });
};

export const useCreateArtworkQuestionReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      artworkId,
      questionId,
      body,
    }: {
      artworkId: number;
      questionId: number;
      body: CreateArtworkQuestionReplyRequestDto;
    }) => createArtworkQuestionReply(artworkId, questionId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.artworkQuestions.list(variables.artworkId),
      });
    },
  });
};

export const useDeleteArtworkQuestionReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      artworkId,
      questionId,
      questionReplyId,
    }: {
      artworkId: number;
      questionId: number;
      questionReplyId: number;
    }) => deleteArtworkQuestionReply(artworkId, questionId, questionReplyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.artworkQuestions.list(variables.artworkId),
      });
    },
  });
};
