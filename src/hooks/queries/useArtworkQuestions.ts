import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  CreateArtworkQuestionReplyRequestDto,
  CreateArtworkQuestionRequestDto,
} from '@/api/dto';
import {
  createArtworkQuestion,
  createArtworkQuestionReply,
  deleteArtworkQuestion,
  getArtworkQuestions,
  getReceivedArtworkQuestions,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useArtworkQuestions = (artworkId: number) =>
  useInfiniteQuery({
    queryKey: queryKeys.artworkQuestions.list(artworkId),
    queryFn: ({ pageParam }) =>
      getArtworkQuestions(artworkId, { cursorId: pageParam ?? undefined }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursorId : null),
    enabled: Number.isFinite(artworkId),
  });

/* 내가 받은(답변할) 질문 목록. 내가 물어본 질문은 useMyArtworkQuestions(hooks/queries/useMyArtworkQuestions.ts)를 씁니다. */
export const useReceivedArtworkQuestions = (params?: {
  cursor?: string;
  size?: number;
  answerStatus?: 'WAITING' | 'ANSWERED';
}) =>
  useQuery({
    queryKey: [...queryKeys.artworkQuestions.me(), params] as const,
    queryFn: () => getReceivedArtworkQuestions(params),
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
