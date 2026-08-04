import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getArtworkDetail, likeArtwork, unlikeArtwork } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useArtworkDetail = (artworkId: number) =>
  useQuery({
    queryKey: queryKeys.displayArtworks.detail(artworkId),
    queryFn: () => getArtworkDetail(artworkId),
    enabled: Number.isFinite(artworkId) && artworkId > 0,
  });

/* 스웨거 기준 POST는 좋아요 추가, DELETE는 취소입니다. */
export const useToggleArtworkLike = (artworkId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (liked: boolean) => (liked ? unlikeArtwork(artworkId) : likeArtwork(artworkId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.displayArtworks.detail(artworkId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.displayArtworks.lists() });
    },
  });
};
