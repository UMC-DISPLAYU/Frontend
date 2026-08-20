import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  CreateExhibitionArtworkRequestDto,
  UpdateExhibitionArtworkRequestDto,
} from '@/api/dto';
import {
  createExhibitionArtwork,
  deleteArtwork,
  getArtistArtworks,
  getDisplayArtworks,
  updateArtworkOrder,
  updateExhibitionArtwork,
} from '@/api/endpoints';
import { getPersonalArtworks } from '@/api/endpoints/personalArtwork';
import { queryKeys } from '@/api/queryKeys';

import { useUserMe } from './useUserProfile';

// GET /v1/artworks?displayId=
export const useDisplayArtworks = (displayId: number) =>
  useQuery({
    queryKey: queryKeys.displayArtworks.byDisplayId(displayId),
    queryFn: () => getDisplayArtworks(displayId),
    enabled: Number.isFinite(displayId) && displayId > 0,
  });

/* 작품 변경 후 해당 전시의 작품 목록을 다시 불러옵니다. */
const useInvalidateDisplayArtworks = (displayId: number) => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.displayArtworks.byDisplayId(displayId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) });
  };
};

// POST /v1/artworks
export const useCreateDisplayArtwork = (displayId: number) => {
  const invalidate = useInvalidateDisplayArtworks(displayId);

  return useMutation({
    mutationFn: (body: CreateExhibitionArtworkRequestDto) =>
      createExhibitionArtwork(displayId, body),
    onSuccess: invalidate,
  });
};

// PATCH /v1/artworks/:artworkId
export const useUpdateDisplayArtwork = (displayId: number) => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateDisplayArtworks(displayId);

  return useMutation({
    mutationFn: ({
      artworkId,
      body,
    }: {
      artworkId: number;
      body: UpdateExhibitionArtworkRequestDto;
    }) => updateExhibitionArtwork(artworkId, body),
    onSuccess: (_, variables) => {
      invalidate();
      queryClient.invalidateQueries({
        queryKey: queryKeys.displayArtworks.detail(variables.artworkId),
      });
    },
  });
};

// PUT /v1/artworks/order
export const useUpdateArtworkOrder = (displayId: number) => {
  const invalidate = useInvalidateDisplayArtworks(displayId);

  return useMutation({
    mutationFn: (orderedArtworkIds: number[]) =>
      updateArtworkOrder(displayId, { displayId, orderedArtworkIds }),
    onSuccess: invalidate,
  });
};

// DELETE /v1/artworks/{artworkId}
export const useDeleteArtwork = (displayId: number) => {
  const invalidate = useInvalidateDisplayArtworks(displayId);

  return useMutation({
    mutationFn: (artworkId: number) => deleteArtwork(artworkId),
    onSuccess: invalidate,
  });
};

// GET /v1/personal-artworks - 내 개인 작품 목록 조회
export const useMyArtworks = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const { data: userData } = useUserMe();
  const userId = userData?.id;

  return useQuery({
    queryKey: [...queryKeys.displayArtworks.me(), userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return getPersonalArtworks(userId);
    },
    enabled: enabled && Boolean(userId),
  });
};

// GET /v1/personal-artworks?userId= - 특정 작가의 개인 작품 목록 조회
export const useUserArtworks = (userId: number, { enabled = true }: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: queryKeys.displayArtworks.byUserId(userId),
    queryFn: () => getPersonalArtworks(userId),
    enabled: enabled && Number.isFinite(userId) && userId > 0,
  });

// GET /v1/artworks?userId= - 특정 작가가 전시에 등록한 작품 목록 조회 (작가 프로필 작품 탭)
export const useArtistExhibitionArtworks = (
  userId: number,
  { enabled = true }: { enabled?: boolean } = {},
) =>
  useQuery({
    queryKey: queryKeys.displayArtworks.byArtistUserId(userId),
    queryFn: () => getArtistArtworks(userId),
    enabled: enabled && Number.isFinite(userId) && userId > 0,
  });
