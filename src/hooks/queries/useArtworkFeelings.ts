import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateArtworkFeelingRequestDto, UpdateArtworkFeelingRequestDto } from '@/api/dto';
import {
  createArtworkFeeling,
  deleteArtworkFeeling,
  getArtworkFeelings,
  toggleArtworkFeelingLike,
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
