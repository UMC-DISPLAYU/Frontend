import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { DisplayDetailDto } from '@/api/dto';
import { getDisplayDetail, toggleDisplayLike, updateDisplayLike } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

export const useDisplayDetail = (displayId: number) =>
  useQuery({
    queryKey: queryKeys.displays.detail(displayId),
    queryFn: () => getDisplayDetail(displayId),
    enabled: Number.isFinite(displayId) && displayId > 0,
  });

/*
 * 스웨거 기준 POST는 좋아요 추가, PATCH는 좋아요 취소입니다.
 * 응답에는 likeCount만 담기므로 좋아요 여부는 요청 종류로 판단해 캐시에 반영합니다.
 */
export const useToggleDisplayLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ displayId, liked }: { displayId: number; liked: boolean }) =>
      liked ? updateDisplayLike({ displayId }) : toggleDisplayLike(displayId),
    onSuccess: (data, { displayId, liked }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.lists() });
      queryClient.setQueryData(
        queryKeys.displays.detail(displayId),
        (current: DisplayDetailDto | undefined) =>
          current ? { ...current, isLiked: !liked, likeCount: data.likeCount } : current,
      );
    },
  });
};
