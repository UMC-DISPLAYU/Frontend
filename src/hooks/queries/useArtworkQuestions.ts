import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  CreateArtworkQuestionReplyRequestDto,
  CreateArtworkQuestionRequestDto,
} from '@/api/dto';
import {
  createArtworkQuestion,
  createArtworkQuestionReply,
  deleteArtworkQuestion,
  getArtworkQuestions,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useArtworkQuestions = (artworkId: number) =>
  useInfiniteQuery({
    queryKey: queryKeys.artworkQuestions.list(artworkId),
    queryFn: ({ pageParam }) =>
      getArtworkQuestions(artworkId, { cursorId: pageParam ?? undefined }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursorId : null),
    enabled: Number.isFinite(artworkId) && artworkId > 0,
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
