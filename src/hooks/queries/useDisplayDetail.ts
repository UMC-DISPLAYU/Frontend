import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getDisplayDetail,
  getDisplayLikeStatus,
  toggleDisplayLike,
  updateDisplayLike,
} from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';
import { useAuthStore } from '@/stores/authStore';

export const useDisplayDetail = (displayId: number) =>
  useQuery({
    queryKey: queryKeys.displays.detail(displayId),
    queryFn: () => getDisplayDetail(displayId),
    enabled: Number.isFinite(displayId) && displayId > 0,
  });

/*
 * 전시 상세 조회는 비회원도 호출 가능해 응답에 좋아요 여부가 담기지 않습니다.
 * 좋아요 여부는 별도 인증 필요 API로 조회합니다.
 */
export const useDisplayLikeStatus = (displayId: number) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: queryKeys.displays.likeStatus(displayId),
    queryFn: () => getDisplayLikeStatus(displayId),
    enabled: !!accessToken && Number.isFinite(displayId) && displayId > 0,
  });
};

/*
 * 스웨거 기준 POST는 좋아요 추가, DELETE는 좋아요 취소입니다.
 * 응답에는 likeCount만 담기므로 좋아요 여부는 요청 종류로 판단해 캐시에 반영합니다.
 */
export const useToggleDisplayLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ displayId, liked }: { displayId: number; liked: boolean }) =>
      liked ? updateDisplayLike({ displayId }) : toggleDisplayLike(displayId),
    onSuccess: (data, { displayId, liked }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.lists() });
      queryClient.setQueryData(queryKeys.displays.likeStatus(displayId), { isLiked: !liked });
      queryClient.setQueryData(
        queryKeys.displays.detail(displayId),
        (current: { likeCount?: number } | undefined) =>
          current ? { ...current, likeCount: data.likeCount } : current,
      );
    },
  });
};
