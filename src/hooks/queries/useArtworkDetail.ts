import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { GetArtworkDetailResponseDataDto } from '@/api/dto/displayArtwork.dto';
import { getArtworkDetail, likeArtwork, unlikeArtwork } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useArtworkDetail = (artworkId: number) =>
  useQuery({
    queryKey: queryKeys.displayArtworks.detail(artworkId),
    queryFn: () => getArtworkDetail(artworkId),
    enabled: Number.isFinite(artworkId) && artworkId > 0,
    staleTime: 1000 * 60 * 3, // 3분 — 반복 방문 시 캐시 활용
  });

/**
 * 작품 좋아요 토글 mutation.
 * Optimistic Update 적용 — 서버 응답 전에 UI를 즉시 반영하고,
 * 실패 시 이전 상태로 롤백합니다.
 */
export const useToggleArtworkLike = (artworkId: number) => {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.displayArtworks.detail(artworkId);

  return useMutation({
    mutationFn: async (currentIsLiked: boolean) => {
      if (currentIsLiked) {
        await unlikeArtwork(artworkId);
      } else {
        await likeArtwork(artworkId);
      }
    },
    onMutate: async (currentIsLiked: boolean) => {
      // 진행 중인 동일 쿼리 취소 (경쟁 상태 방지)
      await queryClient.cancelQueries({ queryKey });

      // 롤백을 위한 이전 상태 스냅샷
      const previousData = queryClient.getQueryData<GetArtworkDetailResponseDataDto>(queryKey);

      // Optimistic Update: 즉시 UI 반영
      queryClient.setQueryData<GetArtworkDetailResponseDataDto>(queryKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          isLiked: !currentIsLiked,
          likeCount: currentIsLiked ? current.likeCount - 1 : current.likeCount + 1,
        };
      });

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      // 실패 시 이전 상태로 롤백
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      // 성공/실패 관계없이 서버 데이터와 동기화
      void queryClient.invalidateQueries({ queryKey });
    },
  });
};
