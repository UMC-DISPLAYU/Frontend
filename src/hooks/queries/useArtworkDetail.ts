import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { GetArtworkDetailResponseDataDto } from '@/api/dto';
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
  const queryKey = queryKeys.displayArtworks.detail(artworkId);

  return useMutation({
    mutationFn: (liked: boolean) => (liked ? unlikeArtwork(artworkId) : likeArtwork(artworkId)),
    onMutate: async (liked) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<GetArtworkDetailResponseDataDto>(queryKey);

      queryClient.setQueryData<GetArtworkDetailResponseDataDto>(queryKey, (old) =>
        old
          ? { ...old, isLiked: !liked, likeCount: Math.max(old.likeCount + (liked ? -1 : 1), 0) }
          : old,
      );

      return { previousData };
    },
    onError: (_, __, context) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.displayArtworks.lists() });
    },
  });
};
