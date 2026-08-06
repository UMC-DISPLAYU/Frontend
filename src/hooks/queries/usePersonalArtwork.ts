import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { PersonalArtworkRequestDto } from '@/api/dto';
import {
  createPersonalArtwork,
  deletePersonalArtwork,
  getPersonalArtwork,
  getPersonalArtworks,
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
