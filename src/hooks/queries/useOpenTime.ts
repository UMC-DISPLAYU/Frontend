import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { UpdateOpenTimeRequestDto } from '@/api/dto';
import { getOpenTime, updateOpenTime } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

// 가짜 쿼리 훅: 백엔드에 공개 시점 설정 API가 생기면 실제 query hook으로 교체해야 합니다.
export const useOpenTime = (displayId: number | undefined) =>
  useQuery({
    queryKey: queryKeys.displays.openTime(displayId ?? 0),
    queryFn: () => getOpenTime(displayId!),
    enabled: Number.isFinite(displayId) && (displayId ?? 0) > 0,
  });

// 가짜 쿼리 훅: 백엔드에 공개 시점 설정 API가 생기면 실제 mutation hook으로 교체해야 합니다.
export const useUpdateOpenTime = (displayId: number | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateOpenTimeRequestDto) => {
      if (!displayId) throw new Error('displayId is required');
      return updateOpenTime(displayId, body);
    },
    onSuccess: () => {
      if (!displayId) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.openTime(displayId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) });
    },
  });
};
