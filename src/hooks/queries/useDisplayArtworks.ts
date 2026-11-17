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

import { refetchForNextScreen } from './refetchForNextScreen';
import { useUserMe } from './useUserProfile';

// GET /v1/artworks?displayId=
export const useDisplayArtworks = (displayId: number) =>
  useQuery({
    queryKey: queryKeys.displayArtworks.byDisplayId(displayId),
    queryFn: () => getDisplayArtworks(displayId),
    enabled: Number.isFinite(displayId) && displayId > 0,
  });

/* 작품 변경 후 전시 · 작가 프로필 · 탐색 · 보관함의 작품 목록을 다시 불러옵니다. */
const useInvalidateDisplayArtworks = (displayId: number) => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.displayArtworks.lists() });
    queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.archives.works.all() });
  };
};

// POST /v1/artworks
export const useCreateDisplayArtwork = (displayId: number) => {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateDisplayArtworks(displayId);

  return useMutation({
    mutationFn: (body: CreateExhibitionArtworkRequestDto) =>
      createExhibitionArtwork(displayId, body),
    // 등록 완료 뒤 돌아가는 전시 작업 목록에 새 작품이 바로 있게 한다
    onSuccess: () => {
      invalidate();
      return refetchForNextScreen(queryClient, [queryKeys.displayArtworks.byDisplayId(displayId)]);
    },
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
    // 저장 뒤 돌아가는 전시 작업 목록 · 작품 상세가 예전 사진 · 제목을 먼저 그리지 않게 한다
    onSuccess: (_, variables) => {
      invalidate();
      return refetchForNextScreen(queryClient, [
        queryKeys.displayArtworks.byDisplayId(displayId),
        queryKeys.displayArtworks.detail(variables.artworkId),
      ]);
    },
  });
};

// PUT /v1/artworks/order
// 다시 불러오기까지 기다린 뒤 끝나게 한다. 그 사이 다음 순서 변경이 들어오면 앞선 결과가 덮어써 순서가 튄다
export const useUpdateArtworkOrder = (displayId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedArtworkIds: number[]) =>
      updateArtworkOrder(displayId, { displayId, orderedArtworkIds }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.displayArtworks.lists() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) }),
      ]),
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
