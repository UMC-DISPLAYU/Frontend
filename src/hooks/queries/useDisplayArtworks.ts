import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateExhibitionArtworkRequestDto } from '@/api/dto';
import {
  createExhibitionArtwork,
  deleteArtwork,
  getDisplayArtworks,
  getMyArtworks,
  updateArtworkOrder,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

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

// 가짜 쿼리 훅: 백엔드에 내 작품 전체 조회 API가 생기면 실제 query hook으로 교체해야 합니다.
export const useMyArtworks = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: queryKeys.displayArtworks.me(),
    queryFn: getMyArtworks,
    enabled,
  });
