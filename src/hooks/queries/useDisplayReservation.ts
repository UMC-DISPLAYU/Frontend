import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateDisplayReservationRequestDto } from '@/api/dto';
import { updateDisplayReservation } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

/* 공개 시점 조회는 전시 상세(useDisplayDetail)에 포함되어 별도 훅이 없습니다. */
export const useUpdateDisplayReservation = (displayId: number | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateDisplayReservationRequestDto) => {
      if (!displayId) throw new Error('displayId is required');
      return updateDisplayReservation(displayId, body);
    },
    onSuccess: () => {
      if (!displayId) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.displays.detail(displayId) });
    },
  });
};
