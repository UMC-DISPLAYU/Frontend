import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateArtworkFeelingRequestDto, UpdateArtworkFeelingRequestDto } from '@/api/dto';
import {
  createArtworkFeeling,
  createArtworkFeelingReply,
  deleteArtworkFeeling,
  deleteArtworkFeelingReply,
  getArtworkFeelingReplies,
  getArtworkFeelings,
  toggleArtworkFeelingLike,
  toggleArtworkFeelingReplyLike,
  updateArtworkFeeling,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useArtworkFeelings = (artworkId: number) =>
  useQuery({
    queryKey: queryKeys.artworkFeelings.list(artworkId),
    queryFn: () => getArtworkFeelings(artworkId),
    enabled: Number.isFinite(artworkId),
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
    mutationFn: ({ artworkId, feelingId }: { artworkId: number; feelingId: number }) =>
      toggleArtworkFeelingLike(artworkId, feelingId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.artworkFeelings.list(variables.artworkId),
      });
    },
  });
};

export const useArtworkFeelingReplies = (artworkId: number, feelingId: number, enabled = true) =>
  useQuery({
    queryKey: queryKeys.artworkFeelings.replies(artworkId, feelingId),
    queryFn: () => getArtworkFeelingReplies(artworkId, feelingId),
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
  const invalidate = useInvalidateFeelingReplies(artworkId, feelingId);

  return useMutation({
    mutationFn: (content: string) => createArtworkFeelingReply(artworkId, feelingId, { content }),
    onSuccess: invalidate,
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
    mutationFn: (feelingReplyId: number) =>
      toggleArtworkFeelingReplyLike(artworkId, feelingId, feelingReplyId),
    onSuccess: invalidate,
  });
};
